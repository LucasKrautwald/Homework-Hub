"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

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
  { bar: string; hoverBorder: string; hoverGlow: string }
> = {
  overdue: {
    bar: "border-l-rose-500",
    hoverBorder: "hover:border-rose-400/40",
    hoverGlow: "hover:shadow-[0_8px_30px_-8px_rgba(244,63,94,0.35)]",
  },
  week: {
    bar: "border-l-amber-500",
    hoverBorder: "hover:border-amber-400/40",
    hoverGlow: "hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.3)]",
  },
  later: {
    bar: "border-l-blue-500",
    hoverBorder: "hover:border-blue-400/40",
    hoverGlow: "hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.35)]",
  },
};

const priorityMeta: Record<
  DashboardTask["priority"],
  { label: string; dot: string }
> = {
  HIGH: { label: "High", dot: "bg-rose-400" },
  MEDIUM: { label: "Med", dot: "bg-amber-400" },
  LOW: { label: "Low", dot: "bg-emerald-400" },
};

const statusLabels: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

function Pill({
  children,
  dot,
}: {
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] font-medium leading-tight text-slate-300">
      {dot ? (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden />
      ) : null}
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
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const s = sectionStyles[section];
  const prio = priorityMeta[task.priority];

  async function complete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (completing) return;
    setCompleting(true);
    const patch = fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    // Deja respirar la micro-animación antes de refrescar la lista
    await Promise.all([patch, new Promise((r) => setTimeout(r, 550))]);
    router.refresh();
  }

  return (
    <div
      className={cn(
        "group/row relative flex items-stretch gap-3 rounded-xl border border-white/[0.08] border-l-2 bg-white/[0.035] p-3 backdrop-blur-md",
        "shadow-sm shadow-black/25 transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:bg-white/[0.06]",
        s.bar,
        s.hoverBorder,
        s.hoverGlow,
        completing &&
          "pointer-events-none -translate-x-3 scale-[0.98] opacity-0 duration-500",
      )}
    >
      <button
        type="button"
        title="Marcar como hecha"
        aria-label={`Completar ${task.title}`}
        onClick={complete}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-xl border-2 transition-all duration-200",
          completing
            ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
            : cn(
                "border-dashed border-white/20 text-slate-400 hover:border-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300",
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
        <span className="block font-semibold text-white">
          {task.title}
          {task.subject ? (
            <span className="font-medium text-slate-400"> · {task.subject}</span>
          ) : null}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium tabular-nums text-slate-500 transition-colors group-hover/row:text-slate-400">
            {task.dueLabel}
          </span>
          <Pill>{task.category === "long" ? "Long" : "Short"}</Pill>
          <Pill>{statusLabels[task.status] ?? task.status.replace("_", " ")}</Pill>
          <Pill dot={prio.dot}>{prio.label}</Pill>
        </span>
      </Link>
    </div>
  );
}
