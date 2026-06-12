function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.05] ${className ?? ""}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="relative -mx-4 min-h-[calc(100vh-6rem)] px-4 pb-12 sm:-mx-6 sm:px-6">
      <div className="space-y-10 pt-2">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Bone className="h-12 w-72 sm:h-14" />
            <Bone className="h-3 w-40" />
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
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-[20px]"
            >
              <div className="flex items-start justify-between gap-3">
                <Bone className="h-3 w-28" />
                <Bone className="h-10 w-10" />
              </div>
              <Bone className="mt-4 h-16 w-16" />
              <Bone className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>

        {[0, 1, 2].map((s) => (
          <section key={s} className="space-y-4">
            <div className="flex items-center gap-3">
              <Bone className="h-8 w-1" />
              <Bone className="h-7 w-36" />
              <Bone className="h-6 w-9 rounded-full" />
            </div>
            <div className="space-y-2.5">
              {[0, 1].map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] border-l-4 border-l-white/10 bg-white/[0.04] p-3"
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
