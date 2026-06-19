"use client";

import { useRef, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { askAssistant } from "@/lib/ask-assistant";
import { TypewriterText } from "@/components/task-completion/typewriter-text";

export type PrioritizeTask = {
  title: string;
  dueAt: string;
  priority: string;
  category: string;
};

export function AiPrioritizeButton({ tasks }: { tasks: PrioritizeTask[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    setResult("");
    dialogRef.current?.showModal();
    if (!result && !loading) void run();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function run() {
    if (tasks.length === 0) {
      setResult("No tienes tareas pendientes. ¡Buen trabajo!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = tasks
        .map(
          (t, i) =>
            `${i + 1}. ${t.title} (vence: ${new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(t.dueAt))}, prioridad: ${t.priority}, tipo: ${t.category})`,
        )
        .join("\n");
      const prompt = `Tengo estas tareas pendientes:\n${list}\nReordénalas de mayor a menor urgencia y explica brevemente por qué en 1 línea cada una. Formato: lista numerada.`;
      const reply = await askAssistant(prompt);
      setResult(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al priorizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={tasks.length === 0}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-5 text-sm font-semibold text-violet-200 shadow-sm transition hover:border-violet-400/40 hover:bg-violet-500/20 hover:text-white disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" />
        Priorizar con IA
      </button>

      <dialog
        ref={dialogRef}
        className="hh-dialog rounded-2xl border border-white/[0.08] bg-[#0d0d14]/95 p-6 text-slate-200 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-[24px]"
        onClick={(ev) => {
          if (ev.target === dialogRef.current) close();
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-white">¿Qué hago primero?</h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 min-h-[12rem]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <p className="text-sm text-slate-400">Analizando tus tareas…</p>
            </div>
          ) : error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : result ? (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <TypewriterText text={result} />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200"
        >
          Cerrar
        </button>
      </dialog>
    </>
  );
}
