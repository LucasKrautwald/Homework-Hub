import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Msg = { role: "user" | "assistant" | "system"; content: string };

function extractUserContent(messages: Msg[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user" && m.content.trim()) {
      return m.content.trim();
    }
  }
  return null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. Add it to .env to use the assistant.",
      },
      { status: 503 },
    );
  }

  let body: { messages?: Msg[]; taskContext?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const userContent = extractUserContent(messages);
  if (!userContent) {
    return NextResponse.json({ error: "user message required" }, { status: 400 });
  }

  const taskContext =
    typeof body.taskContext === "string" ? body.taskContext.trim() : "";

  const systemContent = taskContext
    ? `${taskContext}\n\nResponde en el mismo idioma que use el estudiante. Sé conciso, práctico y específico con sus tareas cuando aplique.`
    : "You are a helpful school assistant inside Homework Hub. Help organize work, plan study time, and explain concepts. Be concise.";

  await prisma.chatMessage.create({
    data: { userId, role: "user", content: userContent },
  });

  const recent = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const history = recent.reverse();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        ...history.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "Upstream error", detail: errText.slice(0, 200) },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";

  await prisma.chatMessage.create({
    data: { userId, role: "assistant", content: text },
  });

  return NextResponse.json({ message: text });
}
