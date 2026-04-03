import { GraduationCap } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl dark:bg-fuchsia-600/20" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-600/15" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/15" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-xl shadow-violet-500/30">
            <GraduationCap className="h-8 w-8" strokeWidth={2} />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
            Homework Hub
          </p>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/85 p-8 shadow-2xl shadow-violet-500/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
          {children}
        </div>
      </div>
    </div>
  );
}
