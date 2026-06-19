"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { TypewriterText } from "@/components/task-completion/typewriter-text";

export function WeeklySummaryCard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!open || fetched) return;
    void loadSummary();
  }, [open, fetched]);

  async function loadSummary() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/weekly-summary");
      const data = (await res.json().catch(() => ({}))) as {
        summary?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "No se pudo cargar el resumen",
        );
      }
      setSummary(data.summary ?? "");
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el resumen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-[20px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <Sparkles className="h-5 w-5 shrink-0 text-violet-400" />
        <span className="flex-1 text-sm font-semibold text-slate-200">
          Tu resumen de esta semana
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300",
            open && "rotate-180",
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
          <div className="border-t border-white/[0.06] px-5 pb-5 pt-2">
            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-3 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-white/[0.06]" />
                <p className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generando resumen…
                </p>
              </div>
            ) : error ? (
              <p className="text-sm text-rose-300">{error}</p>
            ) : summary ? (
              <div className="rounded-xl border border-violet-500/15 bg-violet-500/10 p-4">
                <TypewriterText text={summary} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
