import type { ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { TaskQuickComplete } from "@/components/task-quick-complete";
import { DashboardQuickAdd } from "@/components/dashboard-quick-add";
import { cn } from "@/lib/cn";

function formatTaskDueLabel(d: Date) {
  return format(d, "d MMM", { locale: es }).replace(/\./g, "").trim();
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const notDone = tasks.filter((t) => t.status !== "DONE");
  const openCount = notDone.length;

  const overdue = notDone.filter((t) => isBefore(t.dueAt, today));
  const thisWeek = notDone.filter(
    (t) => !isBefore(t.dueAt, today) && !isAfter(t.dueAt, weekEnd),
  );
  const later = notDone.filter((t) => isAfter(t.dueAt, weekEnd));

  const weekTasks = tasks.filter((t) =>
    isWithinInterval(t.dueAt, { start: weekStart, end: weekEnd }),
  );
  const weekDone = weekTasks.filter((t) => t.status === "DONE").length;
  const weekProgress = weekTasks.length
    ? Math.round((weekDone / weekTasks.length) * 100)
    : 0;

  return (
    <div className="relative isolate -mx-4 min-h-[calc(100vh-6rem)] overflow-hidden px-4 pb-10 text-slate-200 sm:-mx-6 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[#0a0614]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 55% 42% at 85% 0%, rgba(139, 92, 246, 0.22), transparent 55%),
            radial-gradient(ellipse 40% 36% at 12% 18%, rgba(99, 102, 241, 0.18), transparent 50%),
            radial-gradient(ellipse 50% 40% at 92% 0%, rgba(6, 182, 212, 0.14), transparent 52%),
            radial-gradient(ellipse 35% 28% at 0% 55%, rgba(79, 70, 229, 0.12), transparent 48%),
            radial-gradient(ellipse 32% 42% at 52% 100%, rgba(20, 184, 166, 0.08), transparent 50%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
        aria-hidden
      />

      <div className="relative z-0 space-y-8 pt-1">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-2 max-w-md text-sm font-medium text-slate-400">
              Vista rápida de lo que vence y lo que sigue en tu semana.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DashboardQuickAdd />
            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-400/60"
            >
              <Plus className="h-5 w-5" />
              Nueva tarea
            </Link>
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/[0.07] pb-4 text-xs font-medium text-slate-500"
          aria-label="Resumen de tareas"
        >
          <span className="inline-flex items-center gap-2">
            <ClipboardList
              className="h-3.5 w-3.5 shrink-0 text-cyan-400/80"
              aria-hidden
            />
            <span className="tabular-nums text-slate-300">{openCount}</span>
            <span>abiertas</span>
          </span>
          <span className="h-3 w-px bg-white/10" aria-hidden />
          <span className="inline-flex items-center gap-2">
            <CalendarDays
              className="h-3.5 w-3.5 shrink-0 text-amber-400/85"
              aria-hidden
            />
            <span className="tabular-nums text-slate-300">
              {thisWeek.length}
            </span>
            <span>vencen esta semana</span>
          </span>
          <span className="h-3 w-px bg-white/10" aria-hidden />
          <span className="inline-flex items-center gap-2">
            <AlertTriangle
              className="h-3.5 w-3.5 shrink-0 text-rose-400/90"
              aria-hidden
            />
            <span className="tabular-nums text-slate-300">
              {overdue.length}
            </span>
            <span>vencidas</span>
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Tareas abiertas"
            hint="Sin completar"
            value={openCount}
            icon={<ClipboardList className="h-6 w-6 text-cyan-400/90" />}
          />
          <StatCard
            label="Vencen esta semana"
            hint="Hasta el domingo"
            value={thisWeek.length}
            icon={<CalendarDays className="h-6 w-6 text-amber-300/90" />}
          />
          <StatCard
            label="Vencidas"
            hint="Fecha anterior a hoy"
            value={overdue.length}
            icon={<AlertTriangle className="h-6 w-6 text-rose-400" />}
            variant="danger"
          />
        </div>

        <section className="rounded-2xl border border-white/[0.08] bg-[#0f0d18]/90 p-5 shadow-xl shadow-indigo-950/30 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400/90">
                Progreso semanal
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {weekDone} / {weekTasks.length} tareas completadas esta semana
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold tabular-nums text-cyan-200">
              {weekProgress}%
            </span>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
              style={{ width: `${weekProgress}%` }}
            />
          </div>
        </section>

        <TaskSection
          title="Vencidas"
          count={overdue.length}
          accent="rose"
          empty={
            <p className="font-medium text-emerald-300/90">
              Al día: no hay tareas vencidas.
            </p>
          }
        >
          {overdue.map((t) => (
            <li key={t.id}>
              <TaskRow task={t} section="overdue" />
            </li>
          ))}
        </TaskSection>

        <TaskSection
          title="Esta semana"
          count={thisWeek.length}
          accent="amber"
          empty={
            <p className="text-slate-400">
              Nada pendiente en el calendario de esta semana.{" "}
              <Link
                href="/calendar"
                className="font-semibold text-cyan-400 underline decoration-cyan-500/40 underline-offset-2 hover:text-cyan-300"
              >
                Ver calendario
              </Link>
            </p>
          }
        >
          {thisWeek.map((t) => (
            <li key={t.id}>
              <TaskRow task={t} section="week" />
            </li>
          ))}
        </TaskSection>

        <TaskSection
          title="Próximamente"
          count={later.length}
          accent="blue"
          empty={
            <p className="text-slate-400">
              No hay entregas después de esta semana. Añade fechas en{" "}
              <Link
                href="/tasks/new"
                className="font-semibold text-cyan-400 underline decoration-cyan-500/40 underline-offset-2 hover:text-cyan-300"
              >
                nueva tarea
              </Link>
              .
            </p>
          }
        >
          {later.map((t) => (
            <li key={t.id}>
              <TaskRow task={t} section="later" />
            </li>
          ))}
        </TaskSection>
      </div>
    </div>
  );
}

function StatCard({
  label,
  hint,
  value,
  icon,
  variant,
}: {
  label: string;
  hint: string;
  value: number;
  icon: ReactNode;
  variant?: "danger";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-lg shadow-black/25",
        variant === "danger"
          ? "border-rose-900/45 bg-[#120a0a]"
          : "border-slate-700/50 bg-[#0f0d18]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-4xl font-black tabular-nums tracking-tight text-white",
          variant === "danger" && "text-rose-100",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function TaskSection({
  title,
  count,
  accent,
  empty,
  children,
}: {
  title: string;
  count: number;
  accent: "rose" | "amber" | "blue";
  empty: ReactNode;
  children: ReactNode;
}) {
  const bar = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
  }[accent];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={cn("h-8 w-1 rounded-full", bar)} aria-hidden />
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span
          className={cn(
            "inline-flex min-w-8 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset",
            accent === "rose" &&
              "bg-rose-500/15 text-rose-200 ring-rose-500/30",
            accent === "amber" &&
              "bg-amber-500/15 text-amber-100 ring-amber-500/30",
            accent === "blue" &&
              "bg-blue-500/15 text-blue-100 ring-blue-500/35",
          )}
        >
          {count}
        </span>
      </div>
      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#0f0d18]/80 px-5 py-8 text-center text-sm">
          {empty}
        </div>
      ) : (
        <ul className="space-y-2.5">{children}</ul>
      )}
    </section>
  );
}

function TaskRow({
  task,
  section,
}: {
  task: {
    id: string;
    title: string;
    dueAt: Date;
    category: string;
    status: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
  };
  section: "overdue" | "week" | "later";
}) {
  const done = task.status === "DONE";
  const bar = {
    overdue: "border-l-rose-500 bg-[#180a0a]/95",
    week: "border-l-amber-500 bg-[#0f0d18]/95",
    later: "border-l-blue-500 bg-[#0f0d18]/95",
  }[section];

  return (
    <div
      className={cn(
        "group/row flex items-stretch gap-3 rounded-xl border border-white/[0.06] border-l-4 p-3 shadow-md shadow-black/15 backdrop-blur-sm transition-colors duration-150",
        "hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/25",
        bar,
      )}
    >
      <TaskQuickComplete taskId={task.id} isDone={done} className="self-center" />
      <Link
        href={`/tasks/${task.id}`}
        className="min-w-0 flex-1 py-0.5 outline-offset-2 transition-colors group-hover/row:text-white"
      >
        <span className="block font-semibold text-white">{task.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 group-hover/row:text-slate-400">
          <span className="font-medium text-slate-400 tabular-nums group-hover/row:text-slate-300">
            {formatTaskDueLabel(task.dueAt)}
          </span>
          <Badge
            tone={task.category === "long" ? "amber" : "cyan"}
            className={
              task.category === "long"
                ? "!text-amber-100"
                : "!text-cyan-200"
            }
          >
            {task.category === "long" ? "Proyecto largo" : "Corta"}
          </Badge>
          <Badge tone="slate" className="!text-slate-300">
            {task.status.replace("_", " ")}
          </Badge>
          <Badge
            tone={
              task.priority === "HIGH"
                ? "rose"
                : task.priority === "MEDIUM"
                  ? "amber"
                  : "emerald"
            }
            className={
              task.priority === "HIGH"
                ? "!text-rose-100"
                : task.priority === "MEDIUM"
                  ? "!text-amber-100"
                  : "!text-emerald-100"
            }
          >
            {task.priority}
          </Badge>
        </span>
      </Link>
    </div>
  );
}
