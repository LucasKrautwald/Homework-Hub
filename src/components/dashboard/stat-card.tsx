"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Accent = "violet" | "cyan" | "rose";

const accents: Record<
  Accent,
  { glow: string; border: string; icon: string; number: string }
> = {
  violet: {
    glow: "hover:shadow-[0_0_44px_-10px_rgba(139,92,246,0.55)]",
    border: "hover:border-violet-400/35",
    icon: "text-violet-300/80",
    number: "text-white",
  },
  cyan: {
    glow: "hover:shadow-[0_0_44px_-10px_rgba(34,211,238,0.5)]",
    border: "hover:border-cyan-400/35",
    icon: "text-cyan-300/80",
    number: "text-white",
  },
  rose: {
    glow: "hover:shadow-[0_0_44px_-10px_rgba(244,63,94,0.55)]",
    border: "hover:border-rose-400/40",
    icon: "text-rose-300/85",
    number: "text-rose-300",
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
        "group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-all duration-300",
        "hover:-translate-y-0.5",
        a.glow,
        a.border,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]",
            "transition-transform duration-300 ease-out group-hover:rotate-[10deg] group-hover:scale-110",
            a.icon,
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-4xl font-black tabular-nums tracking-tight",
          a.number,
        )}
        aria-label={String(value)}
      >
        {display}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
