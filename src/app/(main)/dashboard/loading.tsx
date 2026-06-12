function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] ${className ?? ""}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="relative isolate -mx-4 min-h-[calc(100vh-6rem)] overflow-hidden px-4 pb-10 sm:-mx-6 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(170deg,#020308_0%,#0f172a_55%,#121a3c_115%)]"
        aria-hidden
      />

      <div className="relative z-0 space-y-8 pt-1">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Bone className="h-9 w-64" />
            <Bone className="h-3.5 w-44" />
          </div>
          <div className="flex gap-3">
            <Bone className="h-12 w-32" />
            <Bone className="h-12 w-40" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <Bone className="h-3 w-28" />
                <Bone className="h-10 w-10" />
              </div>
              <Bone className="mt-4 h-9 w-14" />
              <Bone className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>

        {[0, 1, 2].map((s) => (
          <section key={s} className="space-y-3">
            <div className="flex items-center gap-3">
              <Bone className="h-7 w-[3px]" />
              <Bone className="h-6 w-32" />
              <Bone className="h-5 w-9 rounded-full" />
            </div>
            <div className="space-y-2.5">
              {[0, 1].map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3"
                >
                  <Bone className="h-9 w-9" />
                  <div className="flex-1 space-y-2">
                    <Bone className="h-4 w-1/2" />
                    <Bone className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
