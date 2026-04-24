"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Plus, Zap } from "lucide-react";
function localDateToNoonISO(dateYmd: string) {
  const [y, m, d] = dateYmd.split("-").map(Number);
  if (!y || !m || !d) return new Date().toISOString();
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

export function DashboardQuickAdd() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const x = new Date();
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => {
      setPending(false);
      setError(null);
    };
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        subject: null,
        notes: null,
        dueAt: localDateToNoonISO(dueDate),
        category: "short",
        status: "TODO",
        priority: "MEDIUM",
        googleUrl: null,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("No se pudo guardar. Revisa los campos.");
      return;
    }
    setTitle("");
    close();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-sm shadow-cyan-950/30 transition hover:border-cyan-300/55 hover:bg-cyan-500/25 focus-visible:outline focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      >
        <Zap className="h-4 w-4 text-cyan-300" />
        Quick add
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="hh-dialog rounded-2xl border border-white/15 bg-[#1a1629] p-6 text-slate-200 shadow-2xl shadow-black/50"
        onClick={(ev) => {
          if (ev.target === dialogRef.current) close();
        }}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-300/90">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Quick add
            </span>
          </div>
          <h2 id={titleId} className="text-lg font-bold tracking-tight text-white">
            Nueva tarea rápida
          </h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-300">
            Nombre
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Ensayo de historia"
              className="rounded-xl border border-white/10 bg-[#0d0c15] px-3 py-2.5 text-white outline-none ring-0 transition placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/25"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-300">
            Fecha de entrega
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0d0c15] px-3 py-2.5 text-white outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/25"
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-rose-300">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-teal-500 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Añadir
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
