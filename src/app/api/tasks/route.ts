import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const createSchema = z.object({
  title: z.string().min(1).max(500),
  subject: z.string().max(120).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  dueAt: z.string().datetime(),
  category: z.enum(["short", "long"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  googleUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { title, subject, notes, dueAt, category, status, priority, googleUrl } = parsed.data;
  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      subject: subject?.trim() || null,
      notes: notes?.trim() || null,
      dueAt: new Date(dueAt),
      category,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      googleUrl: googleUrl?.trim() || null,
    },
  });
  return NextResponse.json(task);
}
