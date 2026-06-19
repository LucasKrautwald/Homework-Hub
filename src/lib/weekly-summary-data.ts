import {
  endOfWeek,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  startOfWeek,
} from "date-fns";

type TaskRow = {
  title: string;
  dueAt: Date;
  status: string;
  completedAt: Date | null;
};

export type WeeklySummaryMetrics = {
  openCount: number;
  overdueCount: number;
  completedThisWeek: number;
  openTasks: { title: string; dueAt: Date }[];
  weekTasks: { title: string; dueAt: Date }[];
};

const CACHE_MS = 6 * 60 * 60 * 1000;
const LIST_LIMIT = 8;

export function computeWeeklySummaryMetrics(
  tasks: TaskRow[],
  now = new Date(),
): WeeklySummaryMetrics {
  const today = startOfDay(now);
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const notDone = tasks.filter((t) => t.status !== "DONE");
  const openTasks = notDone.map((t) => ({ title: t.title, dueAt: t.dueAt }));
  const overdueCount = notDone.filter((t) => isBefore(t.dueAt, today)).length;
  const weekTasks = notDone
    .filter(
      (t) => !isBefore(t.dueAt, today) && !isAfter(t.dueAt, weekEnd),
    )
    .map((t) => ({ title: t.title, dueAt: t.dueAt }));
  const completedThisWeek = tasks.filter(
    (t) =>
      t.status === "DONE" &&
      t.completedAt &&
      isWithinInterval(t.completedAt, { start: weekStart, end: weekEnd }),
  ).length;

  return {
    openCount: openTasks.length,
    overdueCount,
    completedThisWeek,
    openTasks,
    weekTasks,
  };
}

export function buildTaskSnapshot(metrics: WeeklySummaryMetrics): string {
  return `${metrics.openCount}:${metrics.overdueCount}:${metrics.completedThisWeek}`;
}

export function isSummaryCacheValid(
  generatedAt: Date,
  storedSnapshot: string,
  currentSnapshot: string,
  now = new Date(),
): boolean {
  return (
    storedSnapshot === currentSnapshot &&
    now.getTime() - generatedAt.getTime() < CACHE_MS
  );
}

function formatTaskList(
  items: { title: string; dueAt: Date }[],
  emptyLabel: string,
): string {
  if (items.length === 0) return emptyLabel;
  const fmt = new Intl.DateTimeFormat("es", { dateStyle: "short" });
  return items
    .slice(0, LIST_LIMIT)
    .map((t) => `${t.title} (${fmt.format(t.dueAt)})`)
    .join("; ");
}

export function buildWeeklySummaryPrompt(metrics: WeeklySummaryMetrics): string {
  const openList = formatTaskList(metrics.openTasks, "ninguna");
  const weekList = formatTaskList(metrics.weekTasks, "ninguna");

  return `Segunda persona (tú). 3 líneas cortas, español, sin markdown:
1) estado actual 2) riesgo principal 3) acción hoy/mañana

Abiertas (${metrics.openCount}): ${openList}
Vencidas: ${metrics.overdueCount}
Vencen esta semana: ${weekList}
Completadas esta semana: ${metrics.completedThisWeek}`;
}
