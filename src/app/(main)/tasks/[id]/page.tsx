import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/task-form";
import { DeleteTaskButton } from "@/components/delete-task-button";

type Props = { params: Promise<{ id: string }> };

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!task) notFound();

  const dueLocal = new Date(task.dueAt);
  dueLocal.setMinutes(dueLocal.getMinutes() - dueLocal.getTimezoneOffset());
  const dueStr = dueLocal.toISOString().slice(0, 16);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 transition hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200"
        >
          ← Back to all homework
        </Link>
        <DeleteTaskButton taskId={task.id} />
      </div>
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </span>
        <h1 className="mt-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-fuchsia-400 dark:to-violet-400">
          Edit homework
        </h1>
        <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">
          {task.title}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Update status, due date, or your Google Doc / Sheet / Slide link.
        </p>
      </div>
      <TaskForm
        taskId={task.id}
        initial={{
          title: task.title,
          subject: task.subject ?? "",
          notes: task.notes ?? "",
          dueAt: dueStr,
          category: task.category,
          status: task.status,
          priority: task.priority,
          googleUrl: task.googleUrl ?? "",
        }}
      />
    </div>
  );
}
