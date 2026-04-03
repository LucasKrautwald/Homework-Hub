import Link from "next/link";
import { Filter, Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TaskQuickComplete } from "@/components/task-quick-complete";
import { cn } from "@/lib/cn";

type FilterKey = "all" | "short" | "long";
type PriorityKey = "all" | "LOW" | "MEDIUM" | "HIGH";

type Props = {
  searchParams: Promise<{ filter?: string; priority?: string; q?: string }>;
};

export default async function TasksPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sp = await searchParams;
  const filter = (sp.filter as FilterKey) || "all";
  const valid: FilterKey = ["all", "short", "long"].includes(filter)
    ? filter
    : "all";
  const priority = (sp.priority as PriorityKey) || "all";
  const validPriority: PriorityKey = ["all", "LOW", "MEDIUM", "HIGH"].includes(
    priority,
  )
    ? priority
    : "all";
  const query = (sp.q ?? "").trim().toLowerCase();

  const categoryWhere =
    valid === "short"
      ? { category: "short" as const }
      : valid === "long"
        ? { category: "long" as const }
        : {};

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id, ...categoryWhere },
    orderBy: { dueAt: "asc" },
  });
  const filteredTasks = tasks.filter((t) => {
    const okPriority = validPriority === "all" || t.priority === validPriority;
    const hay = `${t.title} ${t.subject ?? ""} ${t.notes ?? ""}`.toLowerCase();
    const okQuery = !query || hay.includes(query);
    return okPriority && okQuery;
  });

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "short", label: "Short" },
    { key: "long", label: "Long projects" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-violet-300 dark:via-fuchsia-400 dark:to-cyan-400">
            All homework
          </h1>
          <p className="mt-2 max-w-lg text-sm font-medium text-slate-600 dark:text-slate-400">
            Filter by type, tick off finished work, and open any item to edit details
            or Google links.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-teal-400"
        >
          <Plus className="h-4 w-4" />
          Add homework
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400">
          <Filter className="h-4 w-4 text-violet-500" />
          Filter
        </span>
        {filters.map(({ key, label }) => {
          const active = valid === key;
          return (
            <Link
              key={key}
              href={key === "all" ? "/tasks" : `/tasks?filter=${key}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-all",
                active
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
                  : "bg-white/80 text-slate-600 ring-1 ring-slate-200/80 hover:bg-violet-50 dark:bg-slate-900/60 dark:text-slate-400 dark:ring-white/10 dark:hover:bg-violet-950/40",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-bold text-slate-600 dark:text-slate-400">
          Priority
        </span>
        {(["all", "HIGH", "MEDIUM", "LOW"] as PriorityKey[]).map((p) => {
          const active = validPriority === p;
          const href = `/tasks?filter=${valid}&priority=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
          return (
            <Link
              key={p}
              href={href}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                active
                  ? "bg-cyan-500 text-white shadow"
                  : "bg-white/80 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-white/10",
              )}
            >
              {p === "all" ? "All" : p}
            </Link>
          );
        })}
        <form className="ml-auto">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search title/subject/notes..."
            className="w-60 rounded-full border border-violet-200 bg-white/90 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-900/70 dark:text-slate-200"
          />
          <input type="hidden" name="filter" value={valid} />
          <input type="hidden" name="priority" value={validPriority} />
        </form>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No tasks here yet.{" "}
            <Link
              href="/tasks/new"
              className="font-bold text-violet-600 underline decoration-violet-300 underline-offset-2 dark:text-violet-400"
            >
              Create your first assignment
            </Link>
            .
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((t) => {
            const done = t.status === "DONE";
            return (
              <li key={t.id}>
                <div className="flex items-stretch gap-3 rounded-2xl border border-violet-200/50 bg-white/90 p-3 shadow-md backdrop-blur-sm transition hover:border-violet-300 hover:shadow-lg dark:border-violet-500/15 dark:bg-slate-900/75">
                  <TaskQuickComplete taskId={t.id} isDone={done} />
                  <Link href={`/tasks/${t.id}`} className="min-w-0 flex-1 py-0.5">
                    <span className="block font-semibold text-slate-900 dark:text-white">
                      {t.title}
                    </span>
                    {t.subject ? (
                      <span className="mt-0.5 block text-xs font-semibold text-violet-600 dark:text-violet-300">
                        {t.subject}
                      </span>
                    ) : null}
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(t.dueAt)}
                      <Badge tone={t.category === "long" ? "amber" : "cyan"}>
                        {t.category === "long" ? "Long project" : "Short homework"}
                      </Badge>
                      <Badge
                        tone={
                          t.status === "DONE"
                            ? "emerald"
                            : t.status === "IN_PROGRESS"
                              ? "violet"
                              : "slate"
                        }
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        tone={
                          t.priority === "HIGH"
                            ? "rose"
                            : t.priority === "MEDIUM"
                              ? "amber"
                              : "emerald"
                        }
                      >
                        {t.priority}
                      </Badge>
                    </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
