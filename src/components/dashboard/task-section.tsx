"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Accent = "rose" | "amber" | "blue";

const accents: Record<
  Accent,
  {
    bar: string;
    pill: string;
    glow: string;
    iconGlow: string;
  }
> = {
  rose: {
    bar: "bg-rose-500/80",
    pill: "border-rose-500/20 bg-rose-500/10 text-rose-200 backdrop-blur-md",
    glow: "shadow-[0_0_32px_-8px_rgba(244,63,94,0.35)]",
    iconGlow: "text-rose-400/60 shadow-[0_0_24px_rgba(244,63,94,0.3)]",
  },
  amber: {
    bar: "bg-amber-500/80",
    pill: "border-amber-500/20 bg-amber-500/10 text-amber-100 backdrop-blur-md",
    glow: "shadow-[0_0_32px_-8px_rgba(245,158,11,0.3)]",
    iconGlow: "text-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.25)]",
  },
  blue: {
    bar: "bg-blue-500/80",
    pill: "border-blue-500/20 bg-blue-500/10 text-blue-100 backdrop-blur-md",
    glow: "shadow-[0_0_32px_-8px_rgba(59,130,246,0.35)]",
    iconGlow: "text-blue-400/60 shadow-[0_0_24px_rgba(59,130,246,0.3)]",
  },
};

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
    <section id={id} className="scroll-mt-24 space-y-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span
          className={cn("h-8 w-1 shrink-0 rounded-full", a.bar)}
          aria-hidden
        />
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        <span
          key={count}
          className={cn(
            "inline-flex min-w-8 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
            "animate-[hh-pop_0.35s_ease-out]",
            a.pill,
          )}
        >
          {count}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ease-out group-hover:text-slate-300",
            open ? "rotate-0" : "-rotate-90",
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
            <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center backdrop-blur-[20px]">
              <div
                className={cn(
                  "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]",
                  a.glow,
                )}
              >
                <Sparkles
                  className={cn("h-6 w-6", a.iconGlow)}
                  strokeWidth={1.5}
                />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-200">
                {emptyTitle}
              </p>
              {emptyBody ? (
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                  {emptyBody}
                </p>
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
