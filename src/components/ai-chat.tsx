"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

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

  async function send(text?: string) {
    const raw = (text ?? input).trim();
    if (!raw || pending) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: raw }];
    setMessages(next);
    setPending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: next.map((m) => ({
          role: m.role,
          content: m.content,
        })),
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

  return (
    <div className="overflow-hidden rounded-3xl border border-violet-200/50 bg-white/90 shadow-2xl shadow-violet-500/15 dark:border-violet-500/20 dark:bg-slate-900/80">
      <div className="border-b border-violet-100 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-500/10 px-4 py-3 dark:border-violet-500/20">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Quick prompts
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void send(q)}
              disabled={pending}
              className="rounded-full bg-white/90 px-3 py-1.5 text-left text-xs font-semibold text-violet-800 shadow-sm ring-1 ring-violet-200/80 transition hover:bg-violet-50 disabled:opacity-50 dark:bg-slate-950/60 dark:text-violet-200 dark:ring-violet-500/30 dark:hover:bg-violet-950/80"
            >
              <Sparkles className="mr-1 inline h-3 w-3 text-fuchsia-500" />
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[28rem] min-h-[14rem] space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
              <Bot className="h-8 w-8" />
            </span>
            <p className="max-w-sm text-sm font-medium text-slate-600 dark:text-slate-400">
              Ask anything school-related — or tap a quick prompt above.
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
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                  : "bg-gradient-to-br from-cyan-500 to-teal-500 text-white",
              )}
            >
              {m.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                  : "border border-violet-100 bg-white text-slate-800 dark:border-violet-500/20 dark:bg-slate-950 dark:text-slate-100",
              )}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {pending && (
          <p className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </p>
        )}
      </div>

      {error && (
        <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="flex gap-2 border-t border-violet-100 bg-violet-50/50 p-3 dark:border-violet-500/20 dark:bg-slate-950/50">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ask the assistant…"
          className="min-h-[3rem] flex-1 resize-none rounded-xl border-2 border-violet-100 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white"
        />
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => void send()}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
