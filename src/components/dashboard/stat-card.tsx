"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Accent = "violet" | "cyan" | "rose";

const accents: Record<Accent, { icon: string; dangerBorder?: string }> = {
  violet: { icon: "text-violet-300/70" },
  cyan: { icon: "text-cyan-300/70" },
  rose: {
    icon: "text-rose-300/70",
    dangerBorder:
      "border-rose-500/20 shadow-[0_0_24px_-8px_rgba(244,63,94,0.25)]",
  },
};

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) {
      setValue(target);
      return;
    }
    ran.current = true;
    if (target === 0) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function StatCard({
  label,
  hint,
  value,
  icon,
  accent = "violet",
}: {
  label: string;
  hint: string;
  value: number;
  icon: ReactNode;
  accent?: Accent;
}) {
  const display = useCountUp(value);
  const a = accents[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-lg shadow-black/25 backdrop-blur-[20px] transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)]",
        a.dangerBorder,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] transition-transform duration-300 ease-out group-hover:scale-105",
            a.icon,
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-7xl font-bold tabular-nums tracking-tight text-white",
          accent === "rose" && value > 0 && "text-rose-200",
        )}
        aria-label={String(value)}
      >
        {display}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
