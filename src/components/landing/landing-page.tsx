import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Zap,
} from "lucide-react";

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-600 via-violet-500 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:via-violet-400 hover:to-violet-500 hover:shadow-violet-800/40 ${className}`}
    >
      {children}
    </Link>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <span
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-violet-500/20 blur-3xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d0d14]/90 shadow-[0_32px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-xs text-slate-500">homework-hub.app/panel</span>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-white">Buenos días, Ana</p>
              <p className="text-xs text-slate-500">Tu semana de un vistazo</p>
            </div>
            <span className="rounded-lg bg-violet-500/20 px-2.5 py-1 text-[0.65rem] font-semibold text-violet-200">
              Panel
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pendientes", value: "5", accent: "text-violet-300" },
              { label: "Esta semana", value: "3", accent: "text-cyan-300" },
              { label: "Atrasadas", value: "1", accent: "text-rose-300" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3"
              >
                <p className="text-[0.6rem] uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${s.accent}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { title: "Ensayo de historia", tag: "Corta", tone: "border-l-cyan-400" },
              { title: "Proyecto de biología", tag: "Larga", tone: "border-l-amber-400" },
              { title: "Repaso matemáticas", tag: "Alta", tone: "border-l-rose-400" },
            ].map((t) => (
              <div
                key={t.title}
                className={`rounded-lg border border-white/[0.06] border-l-4 bg-white/[0.03] px-3 py-2.5 ${t.tone}`}
              >
                <p className="text-sm font-medium text-slate-200">{t.title}</p>
                <p className="mt-0.5 text-[0.65rem] text-slate-500">{t.tag}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
            <p className="text-xs text-violet-200/90">
              Resumen IA: prioriza el ensayo — vence mañana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const features = [
    {
      icon: CalendarDays,
      title: "Resumen semanal con IA",
      body: "Cada semana te decimos qué tienes pendiente, qué se atrasó y qué deberías priorizar.",
    },
    {
      icon: Sparkles,
      title: "Asistente de estudio",
      body: "Pregúntale cómo organizar tu tiempo o cómo dividir un proyecto grande en pasos simples.",
    },
    {
      icon: Zap,
      title: "Priorización inteligente",
      body: "La IA ordena tus tareas según fechas y prioridad, para que no tengas que pensarlo.",
    },
  ];

  const steps = [
    { n: "1", title: "Crea tu cuenta gratis" },
    { n: "2", title: "Agrega tus tareas y proyectos" },
    { n: "3", title: "Deja que la IA te ayude a organizarte" },
  ];

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/90 to-violet-800/90 text-white shadow-md shadow-violet-900/30">
              <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-light uppercase tracking-[0.2em] text-slate-300">
              Homework Hub
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Iniciar sesión
            </Link>
            <PrimaryButton href="/register" className="px-5 py-2.5">
              Empieza gratis
            </PrimaryButton>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-5">
                <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Hecho para el colegio
                </p>
                <h1 className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-[3.25rem]">
                  La IA que organiza tu colegio por ti
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-slate-400">
                  Tareas, proyectos y exámenes en un solo lugar — con un asistente
                  de IA que entiende tu semana, no solo tu lista de pendientes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <PrimaryButton href="/register">
                  Empieza gratis
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-400 transition hover:text-violet-300"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              </div>
            </div>
            <DashboardMockup />
          </div>
        </section>

        {/* Problema */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
            <p className="text-lg leading-relaxed text-slate-300 sm:text-xl">
              Notion y Todoist están hechos para todo. Homework Hub está hecho
              para el colegio: entiende la diferencia entre una tarea corta y un
              proyecto largo, y te avisa cuando te estás atrasando.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-12 text-center">
            <h2 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              IA que sí entiende tu semana
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <GlassCard key={title} className="flex flex-col gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{body}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <h2 className="mb-10 text-center text-2xl font-bold text-white sm:text-3xl">
            Cómo funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map(({ n, title }, i) => (
              <div key={n} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 ? (
                  <span
                    className="absolute left-[calc(50%+2rem)] top-6 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-violet-500/40 to-cyan-500/40 md:block"
                    aria-hidden
                  />
                ) : null}
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-600/80 to-violet-800/80 text-lg font-bold text-white shadow-lg shadow-violet-900/30">
                  {n}
                </span>
                <p className="mt-4 max-w-[14rem] text-base font-medium text-slate-200">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <GlassCard className="relative overflow-hidden text-center">
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10"
              aria-hidden
            />
            <div className="relative space-y-6 py-4 sm:py-8">
              <CheckCircle2 className="mx-auto h-10 w-10 text-violet-400" strokeWidth={1.5} />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Únete gratis hoy
              </h2>
              <p className="mx-auto max-w-md text-slate-400">
                Organiza tu colegio en minutos. Sin tarjeta, sin complicaciones.
              </p>
              <PrimaryButton href="/register" className="mx-auto">
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </GlassCard>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center">
        <p className="text-sm text-slate-500">
          Homework Hub © 2026 — Hecho por un estudiante, para estudiantes.
        </p>
      </footer>
    </div>
  );
}
