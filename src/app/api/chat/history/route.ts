import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { groupChatIntoSessions } from "@/lib/chat-history";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    const sessions = groupChatIntoSessions(rows);

    const byDate = sessions.reduce<Record<string, typeof sessions>>(
      (acc, s) => {
        if (!acc[s.dateKey]) acc[s.dateKey] = [];
        acc[s.dateKey].push(s);
        return acc;
      },
      {},
    );

    return NextResponse.json({ sessions, byDate });
  } catch (err) {
    console.error("Chat history error:", err);
    return NextResponse.json({ sessions: [], byDate: {} });
  }
}
