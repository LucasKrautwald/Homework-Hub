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
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/tasks", label: "Homework", Icon: ListTodo },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/ai", label: "Assistant", Icon: Sparkles },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/92 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-b dark:border-violet-500/12 dark:bg-[#0e0c16]/96 dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 rounded-xl px-1 py-0.5 transition hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block truncate bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-sm font-bold tracking-tight text-transparent dark:from-violet-300 dark:to-fuchsia-400">
              Homework Hub
            </span>
            <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-violet-500/80 dark:text-violet-400/80">
              Stay on track
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
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border-b-2 border-transparent px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-violet-600 text-violet-900 dark:border-cyan-400/70 dark:text-cyan-100"
                    : "text-slate-600 hover:border-violet-300/50 hover:text-violet-800 dark:text-slate-400 dark:hover:border-white/10 dark:hover:text-violet-100",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className="ml-1 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Out</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
