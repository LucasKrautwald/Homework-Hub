import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripMarkdown } from "@/lib/strip-markdown";
import {
  buildTaskSnapshot,
  buildWeeklySummaryPrompt,
  computeWeeklySummaryMetrics,
  isSummaryCacheValid,
} from "@/lib/weekly-summary-data";

async function callOpenAi(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("missing_api_key");
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
          content: "Asistente de estudio. Respuestas breves en español.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 256,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Weekly summary OpenAI error:", errText.slice(0, 300));
    throw new Error("openai_error");
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return stripMarkdown(data.choices?.[0]?.message?.content ?? "");
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const tasks = await prisma.task.findMany({
      where: { userId },
      select: {
        title: true,
        dueAt: true,
        status: true,
        completedAt: true,
      },
    });

    const metrics = computeWeeklySummaryMetrics(tasks);
    const snapshot = buildTaskSnapshot(metrics);

    try {
      const cached = await prisma.weeklySummary.findUnique({
        where: { userId },
      });

      if (
        cached &&
        isSummaryCacheValid(cached.generatedAt, cached.taskSnapshot, snapshot)
      ) {
        return NextResponse.json({
          summary: cached.content,
          cached: true,
        });
      }
    } catch (err) {
      console.error("WeeklySummary cache read failed:", err);
    }

    let summary: string;
    try {
      summary = await callOpenAi(buildWeeklySummaryPrompt(metrics));
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      if (code === "missing_api_key") {
        return NextResponse.json(
          {
            error:
              "⚠️ No se pudo conectar con la IA. Verifica tu API key o créditos.",
            errorCode: "missing_api_key",
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "No se pudo generar el resumen. Inténtalo de nuevo." },
        { status: 502 },
      );
    }

    try {
      await prisma.weeklySummary.upsert({
        where: { userId },
        create: {
          userId,
          content: summary,
          taskSnapshot: snapshot,
        },
        update: {
          content: summary,
          taskSnapshot: snapshot,
          generatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("WeeklySummary cache write failed:", err);
    }

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    console.error("Weekly summary route error:", err);
    return NextResponse.json(
      { error: "Error interno al generar el resumen." },
      { status: 500 },
    );
  }
}
