"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

type FilterKey = "all" | "short" | "long";
type PriorityKey = "all" | "LOW" | "MEDIUM" | "HIGH";

function buildHref(
  filter: FilterKey,
  priority: PriorityKey,
  q: string,
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (priority !== "all") params.set("priority", priority);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}

function Chip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-2",
        active
          ? "border-violet-400/40 bg-violet-500/20 text-violet-100 shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]"
          : "border-white/[0.08] bg-white/[0.04] text-slate-400 backdrop-blur-md hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-slate-200",
      )}
    >
      {children}
    </Link>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <div className="-mx-0.5 flex flex-wrap gap-2 px-0.5">{children}</div>
    </div>
  );
}

export function HomeworkFilters({
  filter,
  priority,
  query,
}: {
  filter: FilterKey;
  priority: PriorityKey;
  query: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    router.push(buildHref(filter, priority, q));
  }

  const categoryFilters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "short", label: "Corta" },
    { key: "long", label: "Larga" },
  ];

  const priorityFilters: { key: PriorityKey; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "HIGH", label: "Alta" },
    { key: "MEDIUM", label: "Media" },
    { key: "LOW", label: "Baja" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <FilterGroup label="Tipo">
            {categoryFilters.map(({ key, label }) => (
              <Chip
                key={key}
                active={filter === key}
                href={buildHref(key, priority, query)}
              >
                {label}
              </Chip>
            ))}
          </FilterGroup>

          <div
            className="hidden w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/[0.12] to-transparent sm:block"
            aria-hidden
          />

          <div
            className="h-px w-full shrink-0 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent sm:hidden"
            aria-hidden
          />

          <FilterGroup label="Prioridad">
            {priorityFilters.map(({ key, label }) => (
              <Chip
                key={key}
                active={priority === key}
                href={buildHref(filter, key, query)}
              >
                {label}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <input
          type="search"
          name="q"
          key={searchParams.get("q") ?? ""}
          defaultValue={query}
          placeholder="Buscar título, materia o notas…"
          className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}
