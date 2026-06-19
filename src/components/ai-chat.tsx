"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  ChevronLeft,
  History,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { type ChatSession } from "@/lib/chat-history";
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
  "Planifica mi semana de estudio",
  "Hazme preguntas sobre mis apuntes",
  "Divide un proyecto grande en pasos",
  "Explícame el repaso activo",
];

const CONNECTION_ERROR_CODES = new Set([
  "missing_api_key",
  "auth",
  "quota",
]);

function isConnectionError(data: { errorCode?: string }): boolean {
  return Boolean(data.errorCode && CONNECTION_ERROR_CODES.has(data.errorCode));
}

export function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskContext, setTaskContext] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [byDate, setByDate] = useState<Record<string, ChatSession[]>>({});
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/history");
      if (!res.ok) return;
      const data = (await res.json()) as {
        sessions?: ChatSession[];
        byDate?: Record<string, ChatSession[]>;
      };
      setSessions(data.sessions ?? []);
      setByDate(data.byDate ?? {});
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

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
    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [loadHistory]);

  function startNewConversation() {
    setMessages([]);
    setActiveSessionId(null);
    setError(null);
    setHistoryOpen(false);
  }

  function openSession(session: ChatSession) {
    setMessages(session.messages);
    setActiveSessionId(session.id);
    setError(null);
    setHistoryOpen(false);
  }

  async function send(text?: string) {
    const raw = (text ?? input).trim();
    if (!raw || pending || tasksLoading || !taskContext) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: raw }];
    setMessages(next);
    setActiveSessionId(null);
    setPending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: raw }],
        taskContext,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      errorCode?: string;
      message?: string;
    };
    setPending(false);
    if (!res.ok) {
      if (isConnectionError(data)) {
        setError(
          data.error ??
            "⚠️ No se pudo conectar con la IA. Verifica tu API key o créditos.",
        );
      } else {
        setError(
          typeof data.error === "string"
            ? data.error
            : "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        );
      }
      return;
    }
    setMessages([
      ...next,
      { role: "assistant", content: data.message ?? "" },
    ]);
    void loadHistory();
  }

  const disabled = pending || tasksLoading;

  const dateKeys = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-violet-400/25 hover:text-white"
        >
          {historyOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <History className="h-4 w-4" />
          )}
          {historyOpen ? "Volver al chat" : "Historial"}
        </button>
        {!historyOpen ? (
          <button
            type="button"
            onClick={startNewConversation}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-400 transition hover:text-white"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Nueva
          </button>
        ) : null}
      </div>

      <aside
        className={cn(
          "flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-[24px] lg:max-h-[70vh] lg:w-64",
          historyOpen ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Historial
          </p>
          <button
            type="button"
            onClick={startNewConversation}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-violet-300 transition hover:bg-violet-500/10 hover:text-white"
            title="Nueva conversación"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Nueva
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {historyLoading ? (
            <p className="flex items-center gap-2 px-2 py-4 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando…
            </p>
          ) : sessions.length === 0 ? (
            <p className="px-2 py-4 text-xs leading-relaxed text-slate-500">
              Aún no hay conversaciones guardadas.
            </p>
          ) : (
            dateKeys.map((dateKey) => {
              const daySessions = byDate[dateKey] ?? [];
              const label = daySessions[0]?.dateLabel ?? dateKey;
              return (
                <div key={dateKey} className="mb-3">
                  <p className="px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600">
                    {label}
                  </p>
                  <ul className="space-y-1">
                    {daySessions.map((session) => (
                      <li key={session.id}>
                        <button
                          type="button"
                          onClick={() => openSession(session)}
                          className={cn(
                            "w-full rounded-xl px-3 py-2.5 text-left text-sm transition",
                            activeSessionId === session.id
                              ? "bg-violet-500/15 text-white ring-1 ring-violet-400/30"
                              : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                          )}
                        >
                          <span className="line-clamp-2 leading-snug">
                            {session.preview}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-[70vh] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_32px_64px_rgba(0,0,0,0.35)] backdrop-blur-[24px]",
          historyOpen ? "hidden lg:flex" : "flex",
        )}
      >
          <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Prompts rápidos
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
                  ? "Cargando tus tareas…"
                  : "Pregúntame lo que necesites del colegio o elige una sugerencia."}
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
                Pensando…
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
                  : "Escribe tu pregunta…"
              }
              disabled={disabled}
              className="min-h-[4.5rem] flex-1 resize-none rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] disabled:opacity-50"
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
    </div>
  );
}
