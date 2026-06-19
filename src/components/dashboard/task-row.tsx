"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { categoryLabels, priorityLabels, statusLabels } from "@/lib/task-labels";
import { useTaskCompletion } from "@/components/task-completion/task-completion-provider";

export type DashboardTask = {
  id: string;
  title: string;
  subject: string | null;
  dueLabel: string;
  category: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export type SectionKind = "overdue" | "week" | "later";

const sectionStyles: Record<
  SectionKind,
  {
    bar: string;
    barGlow: string;
    hoverBorder: string;
    hoverGlow: string;
  }
> = {
  overdue: {
    bar: "border-l-rose-500",
    barGlow: "shadow-[-4px_0_12px_-2px_rgba(244,63,94,0.4)]",
    hoverBorder: "hover:border-rose-400/30",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-10px_rgba(244,63,94,0.2),-4px_0_16px_-2px_rgba(244,63,94,0.45)]",
  },
  week: {
    bar: "border-l-amber-500",
    barGlow: "shadow-[-4px_0_12px_-2px_rgba(245,158,11,0.35)]",
    hoverBorder: "hover:border-amber-400/30",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-10px_rgba(245,158,11,0.18),-4px_0_16px_-2px_rgba(245,158,11,0.4)]",
  },
  later: {
    bar: "border-l-blue-500",
    barGlow: "shadow-[-4px_0_12px_-2px_rgba(59,130,246,0.4)]",
    hoverBorder: "hover:border-blue-400/30",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-10px_rgba(59,130,246,0.2),-4px_0_16px_-2px_rgba(59,130,246,0.45)]",
  },
};

type PillTone = "cyan" | "amber" | "violet" | "slate" | "emerald" | "rose";

const pillTones: Record<PillTone, string> = {
  cyan: "border-cyan-400/15 bg-cyan-500/10 text-cyan-200/90",
  amber: "border-amber-400/15 bg-amber-500/10 text-amber-100/90",
  violet: "border-violet-400/15 bg-violet-500/10 text-violet-200/90",
  slate: "border-white/[0.08] bg-white/[0.04] text-slate-300/90",
  emerald: "border-emerald-400/15 bg-emerald-500/10 text-emerald-200/90",
  rose: "border-rose-400/15 bg-rose-500/10 text-rose-200/90",
};

const pillDots: Record<PillTone, string> = {
  cyan: "bg-cyan-400",
  amber: "bg-amber-400",
  violet: "bg-violet-400",
  slate: "bg-slate-400",
  emerald: "bg-emerald-400",
  rose: "bg-rose-400",
};

function Pill({ children, tone }: { children: React.ReactNode; tone: PillTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium leading-tight",
        pillTones[tone],
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", pillDots[tone])}
        aria-hidden
      />
      {children}
    </span>
  );
}

export function TaskRow({
  task,
  section,
}: {
  task: DashboardTask;
  section: SectionKind;
}) {
  const { completeTask } = useTaskCompletion();
  const [completing, setCompleting] = useState(false);
  const s = sectionStyles[section];

  const priorityTone: PillTone =
    task.priority === "HIGH"
      ? "rose"
      : task.priority === "MEDIUM"
        ? "amber"
        : "emerald";

  const categoryTone: PillTone = task.category === "long" ? "amber" : "cyan";
  const statusTone: PillTone =
    task.status === "IN_PROGRESS" ? "violet" : "slate";

  async function complete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (completing) return;
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 400));
    await completeTask({
      id: task.id,
      title: task.title,
      subject: task.subject,
      category: task.category,
    });
  }

  return (
    <div
      className={cn(
        "group/row relative flex items-stretch gap-3 rounded-xl border border-white/[0.08] border-l-4 bg-white/[0.04] p-3 backdrop-blur-[20px]",
        "shadow-sm shadow-black/20 transition-all duration-300 ease-out",
        "hover:scale-[1.01] hover:bg-white/[0.06]",
        s.bar,
        s.barGlow,
        s.hoverBorder,
        s.hoverGlow,
        completing &&
          "pointer-events-none scale-[0.98] opacity-0 duration-500",
      )}
    >
      <button
        type="button"
        title="Marcar como hecha"
        aria-label={`Completar ${task.title}`}
        onClick={complete}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-xl border transition-all duration-200",
          completing
            ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
            : cn(
                "border-white/15 bg-white/[0.03] text-slate-500 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-300",
                "sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus-visible:opacity-100",
              ),
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            d="M4 12.5 9.5 18 20 6.5"
            strokeDasharray={24}
            strokeDashoffset={completing ? 0 : undefined}
            style={
              completing
                ? { animation: "hh-check-draw 0.35s ease-out forwards" }
                : undefined
            }
          />
        </svg>
      </button>

      <Link
        href={`/tasks/${task.id}`}
        className="min-w-0 flex-1 py-0.5 outline-offset-2 transition-colors"
      >
        <span className="block font-semibold text-white/95">
          {task.title}
          {task.subject ? (
            <span className="font-medium text-slate-500"> · {task.subject}</span>
          ) : null}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium tabular-nums text-slate-500">
            {task.dueLabel}
          </span>
          <Pill tone={categoryTone}>
            {categoryLabels[task.category] ?? task.category}
          </Pill>
          <Pill tone={statusTone}>
            {statusLabels[task.status] ?? task.status.replace("_", " ")}
          </Pill>
          <Pill tone={priorityTone}>
            {priorityLabels[task.priority] ?? task.priority}
          </Pill>
        </span>
      </Link>
    </div>
  );
}
