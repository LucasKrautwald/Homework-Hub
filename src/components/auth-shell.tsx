import { GraduationCap } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="relative">
            <span
              className="pointer-events-none absolute inset-x-2 -bottom-3 h-8 rounded-full bg-violet-500/30 blur-xl"
              aria-hidden
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/90 to-violet-800/90 text-white shadow-lg shadow-violet-900/40">
              <GraduationCap className="h-7 w-7" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-5 text-[0.7rem] font-light uppercase tracking-[0.35em] text-slate-400">
            Homework Hub
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)] backdrop-blur-[24px]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
