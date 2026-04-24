import type { ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { TaskQuickComplete } from "@/components/task-quick-complete";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardQuickAdd } from "@/components/dashboard-quick-add";
import { cn } from "@/lib/cn";

function formatTaskDueLabel(d: Date) {
  return format(d, "d MMM", { locale: es }).replace(/\./g, "").trim();
}

function categoryShortLabel(category: string) {
  return category === "long" ? "Long" : "Short";
}

function statusShortLabel(status: string) {
  const map: Record<string, string> = {
    TODO: "Todo",
    IN_PROGRESS: "In progress",
    DONE: "Done",
  };
  return map[status] ?? status.replace("_", " ");
}

function priorityShortLabel(priority: string) {
  const map: Record<string, string> = {
    LOW: "Low",
    MEDIUM: "Med",
    HIGH: "High",
  };
  return map[priority] ?? priority;
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

  return (
    <div className="relative isolate -mx-4 min-h-[calc(100vh-6rem)] overflow-hidden px-4 pb-10 text-slate-200 sm:-mx-6 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[#0a0010]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 78% 65% at 0% 0%, rgba(88, 28, 135, 0.38), transparent 55%),
            radial-gradient(ellipse 72% 58% at 100% 100%, rgba(76, 29, 149, 0.28), transparent 52%),
            radial-gradient(ellipse 45% 38% at 96% 4%, rgba(124, 58, 237, 0.14), transparent 45%),
            radial-gradient(ellipse 40% 32% at 4% 96%, rgba(91, 33, 182, 0.12), transparent 45%)
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
            <DashboardGreeting
              displayName={
                session.user.name ??
                session.user.email?.split("@")[0] ??
                null
              }
            />
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

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Tareas abiertas"
            hint="Sin completar"
            value={openCount}
            icon={
              <ClipboardList
                className="h-6 w-6 text-white/[0.22]"
                strokeWidth={1}
              />
            }
          />
          <StatCard
            label="Vencen esta semana"
            hint="Hasta el domingo"
            value={thisWeek.length}
            icon={
              <CalendarDays
                className="h-6 w-6 text-white/[0.22]"
                strokeWidth={1}
              />
            }
          />
          <StatCard
            label="Vencidas"
            hint="Fecha anterior a hoy"
            value={overdue.length}
            icon={
              <AlertTriangle
                className="h-6 w-6 text-white/[0.22]"
                strokeWidth={1}
              />
            }
            variant="danger"
          />
        </div>

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
        "relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 shadow-md shadow-black/50",
        variant === "danger"
          ? "bg-[#221018]"
          : "bg-[#0e0c12]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-4xl font-black tabular-nums tracking-tight text-white",
          variant === "danger" && "text-[#fb7185]",
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
    rose: "bg-[#f43f5e]",
    amber: "bg-[#f59e0b]",
    blue: "bg-[#3b82f6]",
  }[accent];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={cn("h-7 w-[2px] shrink-0 rounded-full", bar)} aria-hidden />
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
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#0e0c12] px-5 py-8 text-center text-sm">
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
    subject: string | null;
    dueAt: Date;
    category: string;
    status: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
  };
  section: "overdue" | "week" | "later";
}) {
  const done = task.status === "DONE";
  const bar = {
    overdue: "border-l-[#f43f5e]",
    week: "border-l-[#f59e0b]",
    later: "border-l-[#3b82f6]",
  }[section];
  const rowBg = {
    overdue: "bg-[#150808]",
    week: "bg-[#0e0c12]",
    later: "bg-[#0e0c12]",
  }[section];

  return (
    <div
      className={cn(
        "group/row flex items-stretch gap-3 rounded-xl border border-white/[0.06] border-l-2 p-3 shadow-sm shadow-black/40 backdrop-blur-sm transition-colors duration-150",
        rowBg,
        "hover:border-white/[0.11] hover:bg-[#14111c] hover:shadow-md hover:shadow-black/50",
        bar,
      )}
    >
      <TaskQuickComplete taskId={task.id} isDone={done} className="self-center" />
      <Link
        href={`/tasks/${task.id}`}
        className="min-w-0 flex-1 py-0.5 outline-offset-2 transition-colors group-hover/row:text-white"
      >
        <span className="block font-semibold text-white">
          {task.title}
          {task.subject ? (
            <span className="font-medium text-slate-400">
              {" "}
              · {task.subject}
            </span>
          ) : null}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 group-hover/row:text-slate-400">
          <span className="font-medium text-slate-500 tabular-nums group-hover/row:text-slate-400">
            {formatTaskDueLabel(task.dueAt)}
          </span>
          <Badge
            variant="subtle"
            size="xs"
            tone={task.category === "long" ? "amber" : "cyan"}
          >
            {categoryShortLabel(task.category)}
          </Badge>
          <Badge variant="subtle" size="xs" tone="slate">
            {statusShortLabel(task.status)}
          </Badge>
          <Badge
            variant="subtle"
            size="xs"
            tone={
              task.priority === "HIGH"
                ? "rose"
                : task.priority === "MEDIUM"
                  ? "amber"
                  : "emerald"
            }
          >
            {priorityShortLabel(task.priority)}
          </Badge>
        </span>
      </Link>
    </div>
  );
}
