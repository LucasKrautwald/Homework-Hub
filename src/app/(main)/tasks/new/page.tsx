import { Sparkles } from "lucide-react";
import { TaskForm } from "@/components/task-form";

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          New entry
        </span>
        <h1 className="mt-3 bg-gradient-to-r from-violet-700 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-violet-300 dark:to-cyan-400">
          Add homework
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Set a due date, pick short vs long project, and link a Google file when
          you&apos;re ready.
        </p>
      </div>
      <TaskForm />
    </div>
  );
}
