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
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
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
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                  active
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
                    : "text-slate-600 hover:bg-violet-100/80 hover:text-violet-900 dark:text-slate-400 dark:hover:bg-violet-950/50 dark:hover:text-violet-100",
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
