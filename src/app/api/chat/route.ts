import { NextResponse } from "next/server";
import { auth } from "@/auth";

type Msg = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful school assistant inside Homework Hub. Help organize work, plan study time, and explain concepts. Be concise.",
        },
        ...messages.map((m) => ({
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
  return NextResponse.json({ message: text });
}
