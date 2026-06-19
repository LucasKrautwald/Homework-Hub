"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Panel", Icon: LayoutDashboard },
  { href: "/tasks", label: "Tareas", Icon: ListTodo },
  { href: "/calendar", label: "Calendario", Icon: CalendarDays },
  { href: "/ai", label: "Asistente", Icon: Sparkles },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 rounded-xl px-1 py-0.5 transition hover:opacity-90"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/90 to-violet-800/90 text-white shadow-md shadow-violet-900/30">
            <span
              className="pointer-events-none absolute inset-x-1 -bottom-1.5 h-4 rounded-full bg-violet-500/25 blur-md"
              aria-hidden
            />
            <GraduationCap className="relative h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-light uppercase tracking-[0.2em] text-slate-300">
              Homework Hub
            </span>
            <span className="block text-[0.65rem] font-medium text-slate-500">
              Mantente al día
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          {links.map(({ href, label, Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_0_20px_-4px_rgba(139,92,246,0.35)]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-violet-300" : "opacity-70",
                  )}
                />
                <span className="hidden sm:inline">{label}</span>
                {active ? (
                  <span
                    className="absolute inset-x-2 -bottom-[9px] h-[2px] rounded-full bg-gradient-to-r from-violet-400/80 via-fuchsia-400/60 to-violet-400/80"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
          <button
            type="button"
            className="ml-1 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-400 transition hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-300"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
