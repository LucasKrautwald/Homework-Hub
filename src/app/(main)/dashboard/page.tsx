import Link from "next/link";
import { endOfWeek, format, isAfter, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Plus,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardQuickAdd } from "@/components/dashboard-quick-add";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskSection } from "@/components/dashboard/task-section";
import {
  TaskRow,
  type DashboardTask,
  type SectionKind,
} from "@/components/dashboard/task-row";

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

  const notDone = tasks.filter((t) => t.status !== "DONE");
  const openCount = notDone.length;

  const overdue = notDone.filter((t) => isBefore(t.dueAt, today));
  const thisWeek = notDone.filter(
    (t) => !isBefore(t.dueAt, today) && !isAfter(t.dueAt, weekEnd),
  );
  const later = notDone.filter((t) => isAfter(t.dueAt, weekEnd));

  const renderRows = (list: typeof tasks, section: SectionKind) =>
    list.map((t) => (
      <li key={t.id}>
        <TaskRow task={toDashboardTask(t)} section={section} />
      </li>
    ));

  return (
    <div className="relative isolate -mx-4 min-h-[calc(100vh-6rem)] overflow-hidden px-4 pb-10 text-slate-100 sm:-mx-6 sm:px-6">
      {/* Base: negro -> slate-900 -> blue-950 */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(170deg,#020308_0%,#0f172a_55%,#121a3c_115%)]"
        aria-hidden
      />
      {/* Mesh gradient sutil */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 8% -5%, rgba(124, 58, 237, 0.2), transparent 55%),
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(34, 211, 238, 0.1), transparent 50%),
            radial-gradient(ellipse 65% 55% at 95% 100%, rgba(59, 130, 246, 0.14), transparent 52%),
            radial-gradient(ellipse 40% 35% at 0% 100%, rgba(167, 139, 250, 0.1), transparent 45%)
          `,
        }}
      />
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
        aria-hidden
      />

      <div className="relative z-0 space-y-8 pt-1">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <DashboardGreeting
            displayName={
              session.user.name ?? session.user.email?.split("@")[0] ?? null
            }
          />
          <div className="flex flex-wrap items-center gap-3">
            <DashboardQuickAdd />
            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-700/40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-400/60"
            >
              <Plus className="h-5 w-5" />
              Nueva tarea
            </Link>
          </div>
        </div>

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
          emptyTitle="Al día: no hay tareas vencidas."
          emptyBody="Sigue así, lo tienes bajo control."
        >
          {renderRows(overdue, "overdue")}
        </TaskSection>

        <TaskSection
          id="esta-semana"
          title="Esta semana"
          count={thisWeek.length}
          accent="amber"
          emptyTitle="Semana despejada."
          emptyBody={
            <>
              Nada pendiente hasta el domingo.{" "}
              <Link
                href="/calendar"
                className="font-semibold text-cyan-400 underline decoration-cyan-500/40 underline-offset-2 transition hover:text-cyan-300"
              >
                Ver calendario
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
          emptyTitle="Horizonte limpio."
          emptyBody={
            <>
              No hay entregas después de esta semana. Añade fechas en{" "}
              <Link
                href="/tasks/new"
                className="font-semibold text-cyan-400 underline decoration-cyan-500/40 underline-offset-2 transition hover:text-cyan-300"
              >
                nueva tarea
              </Link>
              .
            </>
          }
        >
          {renderRows(later, "later")}
        </TaskSection>
      </div>
    </div>
  );
}
