export type ChatHistoryRow = {
  id: string;
  role: string;
  content: string;
  createdAt: Date | string;
};

export type ChatSession = {
  id: string;
  dateKey: string;
  dateLabel: string;
  preview: string;
  messages: { role: "user" | "assistant"; content: string }[];
};

const SESSION_GAP_MS = 2 * 60 * 60 * 1000;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dateLabel(d: Date): string {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDay.getTime()) / 86400000,
  );
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function groupChatIntoSessions(rows: ChatHistoryRow[]): ChatSession[] {
  if (rows.length === 0) return [];

  const sorted = [...rows].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const sessions: ChatSession[] = [];
  let current: ChatHistoryRow[] = [];
  let lastTime: number | null = null;

  for (const row of sorted) {
    const t = new Date(row.createdAt).getTime();
    if (lastTime !== null && t - lastTime > SESSION_GAP_MS) {
      if (current.length > 0) sessions.push(buildSession(current));
      current = [];
    }
    current.push(row);
    lastTime = t;
  }
  if (current.length > 0) sessions.push(buildSession(current));

  return sessions.reverse();
}

function buildSession(rows: ChatHistoryRow[]): ChatSession {
  const first = rows[0];
  const d = new Date(first.createdAt);
  const previewRow = rows.find((r) => r.role === "user") ?? first;
  return {
    id: first.id,
    dateKey: dateKey(d),
    dateLabel: dateLabel(d),
    preview:
      previewRow.content.length > 48
        ? `${previewRow.content.slice(0, 48)}…`
        : previewRow.content,
    messages: rows.map((r) => ({
      role: r.role === "assistant" ? "assistant" : "user",
      content: r.content,
    })),
  };
}
