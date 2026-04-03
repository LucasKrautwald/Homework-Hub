import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const patchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  subject: z.string().max(120).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  dueAt: z.string().datetime().optional(),
  category: z.enum(["short", "long"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  googleUrl: z.string().url().optional().nullable().or(z.literal("")),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.subject !== undefined && { subject: data.subject?.trim() || null }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      ...(data.dueAt !== undefined && { dueAt: new Date(data.dueAt) }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.googleUrl !== undefined && {
        googleUrl: data.googleUrl?.trim() || null,
      }),
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
