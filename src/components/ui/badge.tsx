import { cn } from "@/lib/cn";

type Tone = "violet" | "cyan" | "amber" | "rose" | "emerald" | "slate";

const tones: Record<Tone, string> = {
  violet:
    "bg-violet-500/15 text-violet-800 ring-violet-500/30 dark:bg-violet-500/20 dark:text-violet-200",
  cyan: "bg-cyan-500/15 text-cyan-800 ring-cyan-500/30 dark:bg-cyan-400/15 dark:text-cyan-200",
  amber:
    "bg-amber-500/15 text-amber-900 ring-amber-500/30 dark:bg-amber-400/15 dark:text-amber-100",
  rose: "bg-rose-500/15 text-rose-800 ring-rose-500/30 dark:bg-rose-400/15 dark:text-rose-100",
  emerald:
    "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-100",
  slate:
    "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
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
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
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
