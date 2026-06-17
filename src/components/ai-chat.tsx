"use client";

import { useEffect, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { formatPendingTasksContext } from "@/lib/format-task-context";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

type ApiTask = {
  title: string;
  subject: string | null;
  dueAt: string;
  priority: string;
  category: string;
  status: string;
};

const QUICK_PROMPTS = [
  "Plan my study time for this week",
  "Quiz me on my notes (general)",
  "Break a big project into smaller steps",
  "Explain active recall in simple terms",
];

export function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskContext, setTaskContext] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("No se pudieron cargar las tareas");
        const tasks = (await res.json()) as ApiTask[];
        if (!cancelled) {
          setTaskContext(formatPendingTasksContext(tasks));
        }
      } catch {
        if (!cancelled) {
          setTaskContext(formatPendingTasksContext([]));
        }
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    }
    void loadTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  async function send(text?: string) {
    const raw = (text ?? input).trim();
    if (!raw || pending || tasksLoading || !taskContext) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: raw }];
    setMessages(next);
    setPending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: raw }],
        taskContext,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "Request failed. Check API key or try again.",
      );
      return;
    }
    setMessages([
      ...next,
      { role: "assistant", content: data.message ?? "" },
    ]);
  }

  const disabled = pending || tasksLoading;

  return (
    <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_32px_64px_rgba(0,0,0,0.35)] backdrop-blur-[24px]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Quick prompts
          </p>
          {tasksLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando tareas…
            </span>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void send(q)}
              disabled={disabled}
              className="flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-left text-sm font-medium text-slate-300 transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-white disabled:opacity-50"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="relative">
              <span
                className="pointer-events-none absolute inset-x-2 -bottom-3 h-10 rounded-full bg-violet-500/30 blur-xl"
                aria-hidden
              />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/90 to-violet-800/90 text-white shadow-lg shadow-violet-900/40">
                <Bot className="h-10 w-10" strokeWidth={1.5} />
              </span>
            </div>
            <p className="max-w-md text-base text-slate-400">
              {tasksLoading
                ? "Cargando tus tareas para personalizar las respuestas…"
                : "Pregunta lo que quieras sobre el colegio — o elige un prompt de arriba."}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}`}
            className={cn(
              "flex gap-3",
              m.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-600/80 to-fuchsia-600/80 text-white"
                  : "bg-gradient-to-br from-violet-600/90 to-violet-800/90 text-white shadow-md shadow-violet-900/30",
              )}
            >
              {m.role === "user" ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3.5 text-[0.9375rem] leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-600/90 to-fuchsia-600/80 text-white shadow-md"
                  : "border border-white/[0.08] bg-white/[0.05] text-slate-200",
              )}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {pending && (
          <p className="flex items-center gap-2 text-sm font-medium text-violet-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </p>
        )}
      </div>

      {error ? (
        <p className="border-t border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-300 sm:px-6">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3 border-t border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={
            tasksLoading
              ? "Cargando contexto de tareas…"
              : "Ask the assistant…"
          }
          disabled={disabled}
          className="min-h-[4.5rem] flex-1 resize-none rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => void send()}
          className="inline-flex h-[4.5rem] w-14 shrink-0 items-center justify-center self-end rounded-xl border border-violet-500/25 bg-gradient-to-r from-violet-600/90 to-violet-500/90 text-white shadow-lg shadow-violet-900/25 transition hover:from-violet-500 hover:to-violet-400/90 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
