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

export function Badge({
  children,
  tone = "slate",
  size = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  size?: "default" | "compact";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "compact"
          ? "px-1.5 py-px text-xs leading-tight"
          : "px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
