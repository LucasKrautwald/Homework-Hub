"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Accent = "rose" | "amber" | "blue";

const accents: Record<Accent, { bar: string; pill: string; stroke: string }> = {
  rose: {
    bar: "bg-rose-500",
    pill: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
    stroke: "stroke-rose-400/50",
  },
  amber: {
    bar: "bg-amber-500",
    pill: "bg-amber-500/15 text-amber-100 ring-amber-500/30",
    stroke: "stroke-amber-400/50",
  },
  blue: {
    bar: "bg-blue-500",
    pill: "bg-blue-500/15 text-blue-100 ring-blue-500/35",
    stroke: "stroke-blue-400/50",
  },
};

function EmptyIllustration({ accent }: { accent: Accent }) {
  return (
    <svg
      viewBox="0 0 96 64"
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("mx-auto h-16 w-24", accents[accent].stroke)}
      aria-hidden
    >
      <rect x="28" y="8" width="40" height="48" rx="6" className="stroke-current" />
      <path d="M40 4h16a4 4 0 0 1 4 4H36a4 4 0 0 1 4-4Z" className="stroke-current" />
      <path d="M38 26h20M38 34h14" className="stroke-current opacity-60" />
      <path d="m40 44 5 5 11-11" className="stroke-current" strokeWidth={2} />
      <circle cx="14" cy="20" r="2" className="stroke-current opacity-50" />
      <circle cx="84" cy="40" r="2.5" className="stroke-current opacity-50" />
      <path d="M80 12v6M77 15h6" className="stroke-current opacity-40" />
      <path d="M12 44v5M9.5 46.5h5" className="stroke-current opacity-40" />
    </svg>
  );
}

export function TaskSection({
  id,
  title,
  count,
  accent,
  emptyTitle,
  emptyBody,
  children,
}: {
  id: string;
  title: string;
  count: number;
  accent: Accent;
  emptyTitle: string;
  emptyBody?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const a = accents[accent];
  const panelId = `${id}-panel`;

  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className={cn("h-7 w-[3px] shrink-0 rounded-full", a.bar)} aria-hidden />
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        <span
          key={count}
          className={cn(
            "inline-flex min-w-8 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset",
            "animate-[hh-pop_0.35s_ease-out]",
            a.pill,
          )}
        >
          {count}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 group-hover:text-slate-300",
            !open && "-rotate-90",
          )}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {count === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.025] px-5 py-8 text-center backdrop-blur-sm">
              <EmptyIllustration accent={accent} />
              <p className="mt-3 text-sm font-semibold text-slate-200">
                {emptyTitle}
              </p>
              {emptyBody ? (
                <p className="mt-1 text-sm text-slate-400">{emptyBody}</p>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-2.5 p-0.5">{children}</ul>
          )}
        </div>
      </div>
    </section>
  );
}
