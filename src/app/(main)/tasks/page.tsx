import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HomeworkCompletedSection } from "@/components/tasks/homework-completed-section";
import { HomeworkFilters } from "@/components/tasks/homework-filters";
import {
  HomeworkKanbanCard,
  type HomeworkTask,
} from "@/components/tasks/homework-kanban-card";

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

  const allTasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });

  const pendingTasks = allTasks.filter((t) => t.status !== "DONE");
  const completedTasks = allTasks.filter((t) => t.status === "DONE");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id, status: { not: "DONE" }, ...categoryWhere },
    orderBy: { dueAt: "asc" },
  });

  const filteredTasks = tasks.filter((t) => {
    const okPriority = validPriority === "all" || t.priority === validPriority;
    const hay = `${t.title} ${t.subject ?? ""} ${t.notes ?? ""}`.toLowerCase();
    const okQuery = !query || hay.includes(query);
    return okPriority && okQuery;
  });

  const serialized: HomeworkTask[] = filteredTasks.map((t) => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    dueAt: t.dueAt.toISOString(),
    category: t.category,
    status: t.status,
    priority: t.priority,
  }));

  const completedSerialized = completedTasks
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.updatedAt).getTime() -
        new Date(a.completedAt ?? a.updatedAt).getTime(),
    )
    .map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      completedAt: t.completedAt?.toISOString() ?? null,
      updatedAt: t.updatedAt.toISOString(),
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Todas las tareas
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {pendingTasks.length} tareas pendientes · {completedTasks.length}{" "}
            completadas
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-violet-500/25 bg-gradient-to-r from-violet-600/90 via-violet-500/90 to-fuchsia-600/90 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:via-violet-400/90 hover:to-fuchsia-500 hover:shadow-violet-800/40"
        >
          <Plus className="h-5 w-5" />
          Nueva tarea
        </Link>
      </div>

      <Suspense fallback={null}>
        <HomeworkFilters
          filter={valid}
          priority={validPriority}
          query={query}
        />
      </Suspense>

      {serialized.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.03] px-6 py-14 text-center backdrop-blur-[20px]">
          <p className="text-base font-semibold text-slate-200">
            No hay tareas pendientes aquí
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Crea una nueva o revisa las completadas abajo.{" "}
            <Link
              href="/tasks/new"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Nueva tarea →
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {serialized.map((task, i) => (
            <HomeworkKanbanCard key={task.id} task={task} index={i} />
          ))}
        </div>
      )}

      <HomeworkCompletedSection tasks={completedSerialized} />
    </div>
  );
}
