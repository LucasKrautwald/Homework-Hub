import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Msg = { role: "user" | "assistant" | "system"; content: string };
type HistoryMsg = { role: string; content: string };

const AI_CONNECTION_ERROR =
  "⚠️ No se pudo conectar con la IA. Verifica tu API key o créditos.";

function parseOpenAiError(
  status: number,
  errText: string,
): { errorCode: string; status: number } {
  let code = "openai_error";
  try {
    const parsed = JSON.parse(errText) as {
      error?: { code?: string; type?: string };
    };
    const errCode = parsed.error?.code ?? parsed.error?.type;
    if (status === 401 || errCode === "invalid_api_key") code = "auth";
    if (errCode === "insufficient_quota") code = "quota";
  } catch {
    if (status === 401) code = "auth";
  }
  const httpStatus = code === "auth" ? 401 : 502;
  return { errorCode: code, status: httpStatus };
}

function extractUserContent(messages: Msg[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user" && m.content.trim()) {
      return m.content.trim();
    }
  }
  return null;
}

async function persistAndLoadHistory(
  userId: string,
  userContent: string,
): Promise<HistoryMsg[]> {
  try {
    await prisma.chatMessage.create({
      data: { userId, role: "user", content: userContent },
    });

    const recent = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return recent.reverse().map((m) => ({ role: m.role, content: m.content }));
  } catch (err) {
    console.error("ChatMessage persistence failed, using stateless fallback:", err);
    return [{ role: "user", content: userContent }];
  }
}

async function saveAssistantMessage(userId: string, content: string) {
  try {
    await prisma.chatMessage.create({
      data: { userId, role: "assistant", content },
    });
  } catch (err) {
    console.error("Failed to save assistant ChatMessage:", err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: AI_CONNECTION_ERROR, errorCode: "missing_api_key" },
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
      return NextResponse.json(
        { error: "user message required" },
        { status: 400 },
      );
    }

    const taskContext =
      typeof body.taskContext === "string" ? body.taskContext.trim() : "";

    const systemContent = taskContext
      ? `${taskContext}\n\nResponde en el mismo idioma que use el estudiante. Sé conciso y práctico.`
      : "Asistente de estudio en Homework Hub. Ayuda a organizar trabajo y explicar conceptos. Sé conciso.";

    const history = await persistAndLoadHistory(userId, userContent);

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
      console.error("OpenAI upstream error:", errText.slice(0, 500));
      const { errorCode, status } = parseOpenAiError(res.status, errText);
      return NextResponse.json(
        { error: AI_CONNECTION_ERROR, errorCode },
        { status },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    await saveAssistantMessage(userId, text);

    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el chat." },
      { status: 500 },
    );
  }
}
