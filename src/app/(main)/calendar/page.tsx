import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";

type Props = { searchParams: Promise<{ m?: string }> };

export default async function CalendarPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sp = await searchParams;
  let monthStart: Date;
  try {
    monthStart = sp.m ? startOfMonth(parseISO(`${sp.m}-01`)) : startOfMonth(new Date());
  } catch {
    monthStart = startOfMonth(new Date());
  }

  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });

  const byDay = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const key = format(t.dueAt, "yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(t);
    byDay.set(key, list);
  }

  const prev = format(addMonths(monthStart, -1), "yyyy-MM");
  const next = format(addMonths(monthStart, 1), "yyyy-MM");
  const label = format(monthStart, "MMMM yyyy");
  const today = new Date();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-violet-300 dark:via-fuchsia-400 dark:to-cyan-400">
            Calendar
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            Dots show due items — tap a task to open it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?m=${prev}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-violet-700 shadow-md ring-1 ring-violet-200/80 transition hover:bg-violet-50 dark:bg-slate-900/80 dark:text-violet-300 dark:ring-violet-500/30 dark:hover:bg-violet-950/80"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="min-w-[12rem] text-center text-base font-bold text-slate-800 dark:text-slate-100">
            {label}
          </span>
          <Link
            href={`/calendar?m=${next}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-violet-700 shadow-md ring-1 ring-violet-200/80 transition hover:bg-violet-50 dark:bg-slate-900/80 dark:text-violet-300 dark:ring-violet-500/30 dark:hover:bg-violet-950/80"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-violet-200/50 bg-white/90 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/20 dark:border-violet-500/20 dark:bg-slate-900/70">
        <div className="grid grid-cols-7 gap-px bg-gradient-to-br from-violet-200/60 to-cyan-200/40 p-px dark:from-violet-900/40 dark:to-cyan-900/30">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="bg-gradient-to-b from-violet-100/90 to-white/90 px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-violet-700 dark:from-violet-950/80 dark:to-slate-900/90 dark:text-violet-300"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = byDay.get(key) ?? [];
            const muted = !isSameMonth(day, monthStart);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={key}
                className={cn(
                  "min-h-[6rem] bg-white/95 p-1.5 dark:bg-slate-950/60",
                  muted && "opacity-45",
                  isToday &&
                    "ring-2 ring-inset ring-cyan-400 shadow-inner shadow-cyan-500/20 dark:ring-cyan-500",
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    isToday
                      ? "bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {format(day, "d")}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {dayTasks.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tasks/${t.id}`}
                        className={cn(
                          "block truncate rounded-lg px-1.5 py-0.5 text-[0.65rem] font-semibold transition hover:brightness-110",
                          t.category === "long"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-100"
                            : "bg-cyan-100 text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-100",
                        )}
                        title={t.title}
                      >
                        {format(t.dueAt, "HH:mm")} {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
