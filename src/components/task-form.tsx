"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  Presentation,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = {
  taskId?: string;
  initial?: {
    title: string;
    subject: string;
    notes: string;
    dueAt: string;
    category: "short" | "long";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    googleUrl: string;
  };
};

const statusOptions: {
  value: "TODO" | "IN_PROGRESS" | "DONE";
  label: string;
  color: string;
}[] = [
  { value: "TODO", label: "To do", color: "from-slate-500 to-slate-600" },
  {
    value: "IN_PROGRESS",
    label: "In progress",
    color: "from-violet-500 to-fuchsia-500",
  },
  { value: "DONE", label: "Done", color: "from-emerald-500 to-teal-500" },
];

const priorityOptions: {
  value: "LOW" | "MEDIUM" | "HIGH";
  label: string;
  color: string;
}[] = [
  { value: "LOW", label: "Low", color: "from-emerald-500 to-teal-500" },
  { value: "MEDIUM", label: "Medium", color: "from-amber-500 to-orange-500" },
  { value: "HIGH", label: "High", color: "from-rose-500 to-red-500" },
];

export function TaskForm({ taskId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [dueAt, setDueAt] = useState(
    initial?.dueAt ??
      (() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      })(),
  );
  const [category, setCategory] = useState<"short" | "long">(
    initial?.category ?? "short",
  );
  const [status, setStatus] = useState<
    "TODO" | "IN_PROGRESS" | "DONE"
  >(initial?.status ?? "TODO");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    initial?.priority ?? "MEDIUM",
  );
  const [googleUrl, setGoogleUrl] = useState(initial?.googleUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const payload = {
      title,
      subject: subject || null,
      notes: notes || null,
      dueAt: new Date(dueAt).toISOString(),
      category,
      status,
      priority,
      googleUrl: googleUrl.trim() || null,
    };
    const url = taskId ? `/api/tasks/${taskId}` : "/api/tasks";
    const res = await fetch(url, {
      method: taskId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!res.ok) {
      setError("Could not save. Check fields and try again.");
      return;
    }
    const data = await res.json();
    router.push(`/tasks/${data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-3xl border border-violet-200/50 bg-white/90 p-6 shadow-xl shadow-violet-500/10 dark:border-violet-500/20 dark:bg-slate-900/75"
    >
      <label className="flex flex-col gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Biology chapter 5 questions"
          className="rounded-xl border-2 border-violet-100 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-inner outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
        Subject (optional)
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Biology, Math, History"
          className="rounded-xl border-2 border-violet-100 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-inner outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
        Due
        <input
          type="datetime-local"
          required
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="rounded-xl border-2 border-violet-100 bg-white px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Category
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCategory("short")}
            className={cn(
              "rounded-2xl border-2 px-4 py-4 text-left transition",
              category === "short"
                ? "border-cyan-400 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-md dark:from-cyan-950/40 dark:to-teal-950/30"
                : "border-slate-200 bg-white hover:border-cyan-200 dark:border-slate-700 dark:bg-slate-950",
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
              Quick
            </span>
            <span className="mt-1 block font-bold text-slate-900 dark:text-white">
              Short homework
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCategory("long")}
            className={cn(
              "rounded-2xl border-2 px-4 py-4 text-left transition",
              category === "long"
                ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md dark:from-amber-950/40 dark:to-orange-950/30"
                : "border-slate-200 bg-white hover:border-amber-200 dark:border-slate-700 dark:bg-slate-950",
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Deep work
            </span>
            <span className="mt-1 block font-bold text-slate-900 dark:text-white">
              Long project
            </span>
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Status
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {statusOptions.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                status === value
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Priority
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {priorityOptions.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPriority(value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                priority === value
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Google file (optional)
        </p>
        <input
          type="url"
          placeholder="https://docs.google.com/..."
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
          className="mt-2 w-full rounded-xl border-2 border-violet-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-500/30"
            href="https://docs.google.com/document/create"
            target="_blank"
            rel="noreferrer"
          >
            <FileText className="h-3.5 w-3.5" /> Doc
          </a>
          <a
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-500/30"
            href="https://docs.google.com/spreadsheets/create"
            target="_blank"
            rel="noreferrer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Sheet
          </a>
          <a
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30"
            href="https://docs.google.com/presentation/create"
            target="_blank"
            rel="noreferrer"
          >
            <Presentation className="h-3.5 w-3.5" /> Slides
          </a>
          {googleUrl ? (
            <a
              href={googleUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-800 ring-1 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-200"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open link
            </a>
          ) : null}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
        <span className="inline-flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-violet-500" />
          Notes
        </span>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ideas, teacher instructions, rubric…"
          className="rounded-xl border-2 border-violet-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        className="w-full"
      >
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving…
          </>
        ) : taskId ? (
          "Save changes"
        ) : (
          "Create homework"
        )}
      </Button>
    </form>
  );
}
