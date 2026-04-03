import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/80 p-5 shadow-xl shadow-violet-500/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70",
        glow &&
          "ring-1 ring-violet-500/20 dark:ring-fuchsia-500/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
