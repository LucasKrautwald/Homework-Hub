"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { askAssistant } from "@/lib/ask-assistant";
import { TypewriterText } from "./typewriter-text";

export type CompletableTask = {
  id: string;
  title: string;
  subject: string | null;
  category: string;
};

type Phase = "reflect" | "loading" | "response";

type Ctx = {
  completeTask: (task: CompletableTask) => Promise<void>;
};

const TaskCompletionContext = createContext<Ctx | null>(null);

export function useTaskCompletion() {
  const ctx = useContext(TaskCompletionContext);
  if (!ctx) {
    throw new Error("useTaskCompletion must be used within TaskCompletionProvider");
  }
  return ctx;
}

function ReflectionSheet({
  task,
  onDone,
}: {
  task: CompletableTask;
  onDone: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reflection, setReflection] = useState("");
  const [phase, setPhase] = useState<Phase>("reflect");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    el.showModal();
    const onClose = () => onDone();
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [onDone]);

  function close() {
    dialogRef.current?.close();
  }

  async function skip() {
    close();
  }

  async function share() {
    const text = reflection.trim();
    if (!text) {
      close();
      return;
    }
    setPending(true);
    setError(null);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: text }),
      });
      setPhase("loading");
      const subject = task.subject ?? "sin materia";
      const prompt = `El estudiante completó la tarea '${task.title}' (materia: ${subject}, tipo: ${task.category}). Su reflexión: '${text}'. Da 2-3 sugerencias cortas y personalizadas para mejorar en el futuro con este tipo de tarea. Sé motivador y específico. Máximo 100 palabras.`;
      const reply = await askAssistant(prompt);
      setAiResponse(reply);
      setPhase("response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al obtener sugerencias");
      setPhase("reflect");
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="hh-reflection-dialog border border-white/[0.08] bg-[#0d0d14]/95 p-6 text-slate-200 shadow-[0_-32px_64px_rgba(0,0,0,0.5)] backdrop-blur-[24px]"
      onClick={(ev) => {
        if (ev.target === dialogRef.current) close();
      }}
    >
      {phase === "reflect" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">
            ¿Cómo te fue con {task.title}?
          </h2>
          <p className="text-sm text-slate-400">
            Opcional — comparte cómo te sentiste o qué aprendiste.
          </p>
          <textarea
            rows={4}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Ej. Me costó la primera parte pero entendí mejor al repasar…"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
          />
          {error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : null}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={skip}
              disabled={pending}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200"
            >
              Saltar
            </button>
            <button
              type="button"
              onClick={() => void share()}
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600/90 to-violet-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-violet-400/90 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Compartir reflexión
            </button>
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-slate-400">Preparando sugerencias…</p>
        </div>
      )}

      {phase === "response" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Sugerencias para ti</h2>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
            <TypewriterText text={aiResponse} />
          </div>
          <button
            type="button"
            onClick={close}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600/90 to-violet-500/90 py-2.5 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-violet-400/90"
          >
            Listo
          </button>
        </div>
      )}
    </dialog>
  );
}

export function TaskCompletionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<CompletableTask | null>(null);

  const completeTask = useCallback(
    async (task: CompletableTask) => {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      setActiveTask(task);
    },
    [],
  );

  const onModalDone = useCallback(() => {
    setActiveTask(null);
    router.refresh();
  }, [router]);

  return (
    <TaskCompletionContext.Provider value={{ completeTask }}>
      {children}
      {activeTask ? (
        <ReflectionSheet task={activeTask} onDone={onModalDone} />
      ) : null}
    </TaskCompletionContext.Provider>
  );
}
