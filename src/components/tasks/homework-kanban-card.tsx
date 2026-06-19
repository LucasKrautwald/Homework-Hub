"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoryLabels, priorityLabels, statusLabels } from "@/lib/task-labels";
import { useTaskCompletion } from "@/components/task-completion/task-completion-provider";

export type HomeworkTask = {
  id: string;
  title: string;
  subject: string | null;
  dueAt: string;
  category: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

const statusProgress: Record<string, number> = {
  TODO: 0,
  IN_PROGRESS: 50,
  DONE: 100,
};

const priorityMeta = {
  HIGH: { label: priorityLabels.HIGH, dot: "bg-rose-400", bg: "bg-rose-500/15 text-rose-200 border-rose-400/20" },
  MEDIUM: { label: priorityLabels.MEDIUM, dot: "bg-amber-400", bg: "bg-amber-500/15 text-amber-100 border-amber-400/20" },
  LOW: { label: priorityLabels.LOW, dot: "bg-emerald-400", bg: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20" },
} as const;

function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 40 + (i % 3) * 20;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              ["--tx" as string]: `${Math.cos(angle) * dist}px`,
              ["--ty" as string]: `${Math.sin(angle) * dist - 20}px`,
              ["--rot" as string]: `${(i % 5) * 72}deg`,
              animation: "hh-confetti-fall 0.6s ease-out forwards",
            }}
          />
        );
      })}
    </div>
  );
}

export function HomeworkKanbanCard({
  task,
  index,
}: {
  task: HomeworkTask;
  index: number;
}) {
  const { completeTask } = useTaskCompletion();
  const [exiting, setExiting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pending, setPending] = useState(false);

  const isLong = task.category === "long";
  const done = task.status === "DONE";
  const progress = statusProgress[task.status] ?? 0;
  const prio = priorityMeta[task.priority];

  const accent = isLong
    ? {
        header: "from-amber-500/25 to-orange-500/10",
        bar: "bg-amber-400",
        glow: "hover:shadow-[0_16px_48px_-12px_rgba(245,158,11,0.25)]",
        border: "hover:border-amber-400/25",
      }
    : {
        header: "from-cyan-500/25 to-teal-500/10",
        bar: "bg-cyan-400",
        glow: "hover:shadow-[0_16px_48px_-12px_rgba(34,211,238,0.22)]",
        border: "hover:border-cyan-400/25",
      };

  async function complete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending || done) return;
    setPending(true);
    setShowConfetti(true);
    await new Promise((r) => setTimeout(r, 350));
    await completeTask({
      id: task.id,
      title: task.title,
      subject: task.subject,
      category: task.category,
    });
    setExiting(true);
    setPending(false);
  }

  const dueFormatted = new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(task.dueAt));

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-[20px] transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:scale-[1.01]",
        accent.glow,
        accent.border,
        exiting && "animate-[hh-card-exit_0.4s_ease-in_forwards]",
        !exiting && "animate-[hh-rise_0.45s_ease-out_both]",
      )}
      style={{ animationDelay: exiting ? undefined : `${index * 60}ms` }}
    >
      <div
        className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          accent.header,
        )}
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
              isLong
                ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
                : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", accent.bar)} />
            {isLong ? categoryLabels.long : categoryLabels.short}
          </span>

          {!done ? (
            <button
              type="button"
              onClick={complete}
              disabled={pending}
              title="Marcar como hecha"
              className={cn(
                "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                pending
                  ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                  : "border-white/15 bg-white/[0.03] text-slate-500 opacity-0 group-hover:opacity-100 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:opacity-100",
              )}
            >
              <ConfettiBurst show={showConfetti} />
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </button>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </span>
          )}
        </div>

        <Link href={`/tasks/${task.id}`} className="flex-1 outline-offset-2">
          <h2 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-white/95">
            {task.title}
          </h2>
          {task.subject ? (
            <p className="mt-1 text-sm text-slate-500">{task.subject}</p>
          ) : null}

          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
            {dueFormatted}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                prio.bg,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", prio.dot)} />
              {prio.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              {statusLabels[task.status] ?? task.status.replace("_", " ")}
            </span>
          </div>
        </Link>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                done
                  ? "bg-emerald-400"
                  : progress >= 50
                    ? "bg-violet-400"
                    : accent.bar,
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
