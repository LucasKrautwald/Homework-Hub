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
        "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
        active
          ? "border-violet-400/40 bg-violet-500/20 text-violet-100 shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]"
          : "border-white/[0.08] bg-white/[0.04] text-slate-400 backdrop-blur-md hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-slate-200",
      )}
    >
      {children}
    </Link>
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
    { key: "all", label: "All" },
    { key: "short", label: "Short" },
    { key: "long", label: "Long" },
  ];

  const priorityFilters: { key: PriorityKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "HIGH", label: "High" },
    { key: "MEDIUM", label: "Medium" },
    { key: "LOW", label: "Low" },
  ];

  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {categoryFilters.map(({ key, label }) => (
          <Chip
            key={key}
            active={filter === key}
            href={buildHref(key, priority, query)}
          >
            {label}
          </Chip>
        ))}
        <span className="mx-1 w-px shrink-0 self-stretch bg-white/[0.08]" aria-hidden />
        {priorityFilters.map(({ key, label }) => (
          <Chip
            key={key}
            active={priority === key}
            href={buildHref(filter, key, query)}
          >
            {label}
          </Chip>
        ))}
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
