import Link from "next/link";
import { endOfWeek, isAfter, isBefore, isWithinInterval, startOfDay, addDays } from "date-fns";
import { Plus, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TaskQuickComplete } from "@/components/task-quick-complete";
import { cn } from "@/lib/cn";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });

  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);

  const overdue = tasks.filter(
    (t) => t.status !== "DONE" && isBefore(t.dueAt, today),
  );
  const upcoming = tasks.filter(
    (t) =>
      t.status !== "DONE" &&
      !isBefore(t.dueAt, today) &&
      !isAfter(t.dueAt, weekEnd),
  );
  const openCount = tasks.filter((t) => t.status !== "DONE").length;
  const weekStart = startOfDay(new Date());
  const weekEndFull = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekTasks = tasks.filter((t) =>
    isWithinInterval(t.dueAt, { start: weekStart, end: weekEndFull }),
  );
  const weekDone = weekTasks.filter((t) => t.status === "DONE").length;
  const weekProgress = weekTasks.length
    ? Math.round((weekDone / weekTasks.length) * 100)
    : 0;
  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
  const focusToday = tasks
    .filter((t) => t.status !== "DONE")
    .sort((a, b) => {
      const p = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (p !== 0) return p;
      return +a.dueAt - +b.dueAt;
    })
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-violet-300 dark:via-fuchsia-400 dark:to-cyan-400">
            Dashboard
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium text-slate-600 dark:text-slate-400">
            Your at-a-glance view — crush deadlines before they crush you.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-fuchsia-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <Plus className="h-5 w-5" />
          New homework
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card glow className="border-cyan-200/60 dark:border-cyan-500/20">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            Open tasks
          </p>
          <p className="mt-2 text-4xl font-black tabular-nums text-slate-900 dark:text-white">
            {openCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Everything not marked done</p>
        </Card>
        <Card glow className="border-rose-200/60 dark:border-rose-500/20">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Overdue
          </p>
          <p className="mt-2 text-4xl font-black tabular-nums text-slate-900 dark:text-white">
            {overdue.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Past due date</p>
        </Card>
        <Card glow className="border-violet-200/60 dark:border-violet-500/20">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Due in 7 days
          </p>
          <p className="mt-2 text-4xl font-black tabular-nums text-slate-900 dark:text-white">
            {upcoming.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Coming up this week</p>
        </Card>
      </div>

      <Card glow>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Weekly progress
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {weekDone} / {weekTasks.length} tasks completed this week
            </p>
          </div>
          <Badge tone="violet">{weekProgress}%</Badge>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/40">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
            style={{ width: `${weekProgress}%` }}
          />
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Focus today
          </h2>
          <Badge tone="cyan">{focusToday.length}</Badge>
        </div>
        {focusToday.length === 0 ? (
          <Card className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              You are fully clear right now.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {focusToday.map((t) => (
              <li key={`focus-${t.id}`}>
                <TaskRow task={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Overdue
          </h2>
          <Badge tone="rose">{overdue.length}</Badge>
        </div>
        {overdue.length === 0 ? (
          <Card className="border-dashed border-2 border-emerald-300/60 bg-emerald-50/50 text-center dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <p className="font-medium text-emerald-800 dark:text-emerald-200">
              You&apos;re clear — nothing overdue.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {overdue.map((t) => (
              <li key={t.id}>
                <TaskRow task={t} urgent />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Due in the next 7 days
          </h2>
          <Badge tone="violet">{upcoming.length}</Badge>
        </div>
        {upcoming.length === 0 ? (
          <Card className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Nothing due this week. Add something on the{" "}
              <Link
                href="/calendar"
                className="font-semibold text-violet-600 underline decoration-violet-300 underline-offset-2 dark:text-violet-400"
              >
                calendar
              </Link>
              .
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((t) => (
              <li key={t.id}>
                <TaskRow task={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TaskRow({
  task,
  urgent,
}: {
  task: {
    id: string;
    title: string;
    dueAt: Date;
    category: string;
    status: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
  };
  urgent?: boolean;
}) {
  const done = task.status === "DONE";
  return (
    <div
      className={cn(
        "flex items-stretch gap-3 rounded-2xl border bg-white/90 p-3 shadow-md backdrop-blur-sm transition hover:shadow-lg dark:bg-slate-900/80",
        urgent
          ? "border-rose-300/80 ring-1 ring-rose-400/30 dark:border-rose-500/40"
          : "border-violet-200/60 dark:border-violet-500/20",
      )}
    >
      <TaskQuickComplete taskId={task.id} isDone={done} className="self-center" />
      <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1 py-0.5">
        <span className="block font-semibold text-slate-900 dark:text-white">
          {task.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(task.dueAt)}
          </span>
          <Badge tone={task.category === "long" ? "amber" : "cyan"}>
            {task.category === "long" ? "Long project" : "Short"}
          </Badge>
          <Badge tone="slate">{task.status.replace("_", " ")}</Badge>
          <Badge
            tone={
              task.priority === "HIGH"
                ? "rose"
                : task.priority === "MEDIUM"
                  ? "amber"
                  : "emerald"
            }
          >
            {task.priority}
          </Badge>
        </span>
      </Link>
    </div>
  );
}
