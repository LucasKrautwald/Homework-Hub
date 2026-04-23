import { Sparkles, Zap } from "lucide-react";
import { TaskForm } from "@/components/task-form";

type Props = { searchParams: Promise<{ quick?: string }> };

export default async function NewTaskPage({ searchParams }: Props) {
  const sp = await searchParams;
  const quick = sp.quick === "1" || sp.quick === "true";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <span
          className={
            quick
              ? "inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-200"
              : "inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200"
          }
        >
          {quick ? (
            <Zap className="h-3.5 w-3.5" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {quick ? "Quick add" : "New entry"}
        </span>
        <h1 className="mt-3 bg-gradient-to-r from-violet-700 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-violet-300 dark:to-cyan-400">
          {quick ? "Añadir rápido" : "Add homework"}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {quick
            ? "Escribe el título y ajusta la fecha cuando puedas."
            : `Set a due date, pick short vs long project, and link a Google file when you're ready.`}
        </p>
      </div>
      <TaskForm autoFocusTitle={quick} />
    </div>
  );
}
