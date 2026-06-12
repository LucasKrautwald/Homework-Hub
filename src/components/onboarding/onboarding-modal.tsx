"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Loader2,
  Palette,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ONBOARDING_KEY = "hh-onboarding-done";
const SUBJECTS_KEY = "hh-subject-preferences";

const SUBJECTS = [
  { id: "math", label: "Matemáticas", Icon: Calculator },
  { id: "physics", label: "Física", Icon: Atom },
  { id: "chemistry", label: "Química", Icon: FlaskConical },
  { id: "history", label: "Historia", Icon: Globe },
  { id: "english", label: "Inglés", Icon: BookOpen },
  { id: "literature", label: "Literatura", Icon: BookOpen },
  { id: "biology", label: "Biología", Icon: FlaskConical },
  { id: "art", label: "Arte", Icon: Palette },
  { id: "other", label: "Otra", Icon: Plus },
] as const;

function ConfettiOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const dist = 80 + (i % 4) * 40;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              ["--tx" as string]: `${Math.cos(angle) * dist}px`,
              ["--ty" as string]: `${Math.sin(angle) * dist + 60}px`,
              ["--rot" as string]: `${(i % 6) * 60}deg`,
              animation: "hh-confetti-fall 0.8s ease-out forwards",
            }}
          />
        );
      })}
    </div>
  );
}

export function OnboardingModal({
  userName,
  taskCount,
}: {
  userName: string;
  taskCount: number;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(userName);
  const [school, setSchool] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const x = new Date();
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  });
  const [pending, setPending] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_KEY) === "true" || taskCount > 0) return;
      setVisible(true);
    } catch {
      /* ignore */
    }
  }, [taskCount]);

  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [visible]);

  function finish() {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      /* ignore */
    }
    dialogRef.current?.close();
    setVisible(false);
    router.refresh();
  }

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function createTask() {
    if (!title.trim()) return;
    setPending(true);
    const [y, m, d] = dueDate.split("-").map(Number);
    const dueAt = new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        subject: selectedSubjects[0]
          ? SUBJECTS.find((s) => s.id === selectedSubjects[0])?.label ?? null
          : null,
        notes: school ? `Colegio/grado: ${school}` : null,
        dueAt,
        category: "short",
        status: "TODO",
        priority: "MEDIUM",
        googleUrl: null,
      }),
    });
    setPending(false);
    if (!res.ok) return;
    try {
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(selectedSubjects));
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      /* ignore */
    }
    setConfetti(true);
    setTimeout(() => {
      dialogRef.current?.close();
      setVisible(false);
      router.refresh();
    }, 1200);
  }

  if (!visible) return null;

  return (
    <>
      <ConfettiOverlay show={confetti} />
      <dialog
        ref={dialogRef}
        className="hh-dialog w-[min(100vw-2rem,28rem)] rounded-2xl border border-white/[0.08] bg-[#0d0d14]/95 p-6 text-slate-200 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-[24px]"
        onClick={(ev) => {
          if (ev.target === dialogRef.current && step > 1) finish();
        }}
      >
        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-violet-400" : "w-3 bg-white/15",
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              ¡Bienvenido, {name || userName}! 👋
            </h2>
            <p className="text-sm text-slate-400">
              Confirma tu nombre y cuéntanos un poco de ti.
            </p>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
              Nombre
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white outline-none focus:border-violet-400/50"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
              Colegio / grado (opcional)
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ej. 11° — Colegio San José"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
              />
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05]"
              >
                Saltar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600/90 to-violet-500/90 py-2.5 text-sm font-semibold text-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">¿Qué materias llevas?</h2>
            <p className="text-sm text-slate-400">Selecciona todas las que apliquen.</p>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map(({ id, label, Icon }) => {
                const active = selectedSubjects.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSubject(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                      active
                        ? "border-violet-400/40 bg-violet-500/15 text-violet-100"
                        : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.14]",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05]"
              >
                Saltar
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(
                      SUBJECTS_KEY,
                      JSON.stringify(selectedSubjects),
                    );
                  } catch {
                    /* ignore */
                  }
                  setStep(3);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600/90 to-violet-500/90 py-2.5 text-sm font-semibold text-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Agrega tu primera tarea</h2>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
              Título
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Ensayo de historia"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
              Fecha de entrega
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-white outline-none focus:border-violet-400/50"
              />
            </label>
            <button
              type="button"
              disabled={pending || !title.trim()}
              onClick={() => void createTask()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Crear tarea y empezar
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
