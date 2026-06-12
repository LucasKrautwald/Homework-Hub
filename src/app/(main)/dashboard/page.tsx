import Link from "next/link";
import {
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Plus,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AiPrioritizeButton } from "@/components/dashboard/ai-prioritize-button";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardQuickAdd } from "@/components/dashboard-quick-add";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskSection } from "@/components/dashboard/task-section";
import {
  TaskRow,
  type DashboardTask,
  type SectionKind,
} from "@/components/dashboard/task-row";
import { WeeklySummaryCard } from "@/components/dashboard/weekly-summary-card";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

function toDashboardTask(t: {
  id: string;
  title: string;
  subject: string | null;
  dueAt: Date;
  category: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}): DashboardTask {
  return {
    id: t.id,
    title: t.title,
    subject: t.subject,
    dueLabel: format(t.dueAt, "d MMM", { locale: es }).replace(/\./g, "").trim(),
    category: t.category,
    status: t.status,
    priority: t.priority,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });

  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const notDone = tasks.filter((t) => t.status !== "DONE");
  const openCount = notDone.length;

  const overdue = notDone.filter((t) => isBefore(t.dueAt, today));
  const thisWeek = notDone.filter(
    (t) => !isBefore(t.dueAt, today) && !isAfter(t.dueAt, weekEnd),
  );
  const later = notDone.filter((t) => isAfter(t.dueAt, weekEnd));

  const completedThisWeek = tasks.filter(
    (t) =>
      t.status === "DONE" &&
      t.completedAt &&
      isWithinInterval(t.completedAt, { start: weekStart, end: weekEnd }),
  ).length;

  const displayName =
    session.user.name ?? session.user.email?.split("@")[0] ?? "Estudiante";

  const prioritizeTasks = notDone.map((t) => ({
    title: t.title,
    dueAt: t.dueAt.toISOString(),
    priority: t.priority,
    category: t.category,
  }));

  const renderRows = (list: typeof tasks, section: SectionKind) =>
    list.map((t) => (
      <li key={t.id}>
        <TaskRow task={toDashboardTask(t)} section={section} />
      </li>
    ));

  return (
    <div className="relative -mx-4 min-h-[calc(100vh-6rem)] px-4 pb-12 text-slate-100 sm:-mx-6 sm:px-6">
      <OnboardingModal userName={displayName} taskCount={tasks.length} />

      <div className="space-y-10 pt-2">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <DashboardGreeting displayName={displayName} />
          <div className="flex flex-wrap items-center gap-3">
            <DashboardQuickAdd />
            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-600/80 via-violet-500/80 to-violet-600/80 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition hover:from-violet-500/90 hover:via-violet-400/80 hover:to-violet-500/90 hover:shadow-violet-800/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-400/40"
            >
              <Plus className="h-5 w-5" />
              Nueva tarea
            </Link>
            <AiPrioritizeButton tasks={prioritizeTasks} />
          </div>
        </div>

        <WeeklySummaryCard
          data={{
            userId: session.user.id,
            userName: displayName,
            overdueCount: overdue.length,
            weekTasks: thisWeek.map((t) => ({
              title: t.title,
              dueAt: t.dueAt.toISOString(),
            })),
            completedThisWeek,
          }}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Tareas abiertas"
            hint="Sin completar"
            value={openCount}
            accent="violet"
            icon={<ClipboardList className="h-5 w-5" strokeWidth={1.5} />}
          />
          <StatCard
            label="Vencen esta semana"
            hint="Hasta el domingo"
            value={thisWeek.length}
            accent="cyan"
            icon={<CalendarDays className="h-5 w-5" strokeWidth={1.5} />}
          />
          <StatCard
            label="Vencidas"
            hint="Fecha anterior a hoy"
            value={overdue.length}
            accent="rose"
            icon={<AlertTriangle className="h-5 w-5" strokeWidth={1.5} />}
          />
        </div>

        <TaskSection
          id="vencidas"
          title="Vencidas"
          count={overdue.length}
          accent="rose"
          defaultOpen={overdue.length > 0}
          storageKey="hh-section-vencidas"
          emptyTitle="Todo al día."
          emptyBody="No tienes tareas vencidas. Mantén el ritmo — cada entrega cuenta."
        >
          {renderRows(overdue, "overdue")}
        </TaskSection>

        <TaskSection
          id="esta-semana"
          title="Esta semana"
          count={thisWeek.length}
          accent="amber"
          defaultOpen={false}
          storageKey="hh-section-esta-semana"
          emptyTitle="Semana despejada."
          emptyBody={
            <>
              Nada pendiente hasta el domingo.{" "}
              <Link
                href="/calendar"
                className="font-medium text-violet-400/90 transition hover:text-violet-300"
              >
                Ver calendario →
              </Link>
            </>
          }
        >
          {renderRows(thisWeek, "week")}
        </TaskSection>

        <TaskSection
          id="proximamente"
          title="Próximamente"
          count={later.length}
          accent="blue"
          defaultOpen={false}
          storageKey="hh-section-proximamente"
          emptyTitle="Horizonte limpio."
          emptyBody={
            <>
              Sin entregas después de esta semana. Planifica con{" "}
              <Link
                href="/tasks/new"
                className="font-medium text-violet-400/90 transition hover:text-violet-300"
              >
                nueva tarea →
              </Link>
            </>
          }
        >
          {renderRows(later, "later")}
        </TaskSection>
      </div>
    </div>
  );
}
