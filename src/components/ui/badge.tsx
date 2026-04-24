import { cn } from "@/lib/cn";

type Tone = "violet" | "cyan" | "amber" | "rose" | "emerald" | "slate";

const tones: Record<Tone, string> = {
  violet:
    "border border-violet-500/35 bg-violet-500/15 text-violet-900 dark:border-violet-400/45 dark:bg-violet-500/25 dark:text-violet-100",
  cyan:
    "border border-cyan-500/40 bg-cyan-500/15 text-cyan-900 dark:border-cyan-400/55 dark:bg-cyan-500/30 dark:text-cyan-100",
  amber:
    "border border-amber-500/40 bg-amber-500/15 text-amber-950 dark:border-amber-400/55 dark:bg-amber-500/30 dark:text-amber-50",
  rose:
    "border border-rose-500/40 bg-rose-500/15 text-rose-900 dark:border-rose-400/55 dark:bg-rose-500/30 dark:text-rose-50",
  emerald:
    "border border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:border-emerald-400/50 dark:bg-emerald-500/30 dark:text-emerald-50",
  slate:
    "border border-slate-400/45 bg-slate-500/12 text-slate-800 dark:border-slate-500/50 dark:bg-slate-800/55 dark:text-slate-100",
};

/** Dashboard task pills: dark translucent, whisper borders, light text */
const subtleTones: Record<Tone, string> = {
  violet:
    "border border-violet-400/12 bg-black/35 text-violet-200/90 dark:border-violet-400/15 dark:bg-black/40 dark:text-violet-100/90",
  cyan:
    "border border-cyan-400/15 bg-black/35 text-cyan-100/90 dark:border-cyan-400/18 dark:bg-black/40 dark:text-cyan-100/85",
  amber:
    "border border-amber-400/15 bg-black/35 text-amber-100/90 dark:border-amber-400/18 dark:bg-black/40 dark:text-amber-50/90",
  rose:
    "border border-rose-400/15 bg-black/35 text-rose-100/90 dark:border-rose-400/18 dark:bg-black/40 dark:text-rose-100/85",
  emerald:
    "border border-emerald-400/15 bg-black/35 text-emerald-100/90 dark:border-emerald-400/18 dark:bg-black/40 dark:text-emerald-100/85",
  slate:
    "border border-white/[0.08] bg-black/35 text-slate-300/95 dark:border-white/10 dark:bg-black/40 dark:text-slate-200/90",
};

export function Badge({
  children,
  tone = "slate",
  size = "default",
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  size?: "default" | "compact" | "xs";
  variant?: "default" | "subtle";
  className?: string;
}) {
  const palette = variant === "subtle" ? subtleTones : tones;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "xs"
          ? "px-1 py-px text-[0.625rem] leading-tight font-normal tracking-wide"
          : size === "compact"
            ? "px-1.5 py-px text-xs leading-tight"
            : "px-2.5 py-0.5 text-xs font-semibold",
        palette[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
