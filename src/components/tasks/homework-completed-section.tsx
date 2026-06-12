"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

export type CompletedTask = {
  id: string;
  title: string;
  subject: string | null;
  completedAt: string | null;
  updatedAt: string;
};

export function HomeworkCompletedSection({
  tasks,
}: {
  tasks: CompletedTask[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reopening, setReopening] = useState<string | null>(null);

  if (tasks.length === 0) return null;

  async function reopen(id: string) {
    setReopening(id);
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "TODO" }),
    });
    setReopening(null);
    router.refresh();
  }

  return (
    <section className="mt-10 space-y-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition hover:bg-white/[0.02]"
      >
        <span className="h-8 w-1 shrink-0 rounded-full bg-emerald-500/80" />
        <h2 className="text-xl font-bold text-white sm:text-2xl">Completadas</h2>
        <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-200 backdrop-blur-md">
          {tasks.length}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:text-slate-300",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tasks.map((task) => {
              const doneDate = task.completedAt ?? task.updatedAt;
              const formatted = new Intl.DateTimeFormat("es", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(doneDate));

              return (
                <li
                  key={task.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 opacity-70 backdrop-blur-[20px] transition hover:opacity-85"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-400 line-through">
                        {task.title}
                      </h3>
                      {task.subject ? (
                        <p className="mt-0.5 text-xs text-slate-600">
                          {task.subject}
                        </p>
                      ) : null}
                    </Link>
                    <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-300">
                      Done
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Completada {formatted}
                  </p>
                  <button
                    type="button"
                    disabled={reopening === task.id}
                    onClick={() => void reopen(task.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-slate-200 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reabrir
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
