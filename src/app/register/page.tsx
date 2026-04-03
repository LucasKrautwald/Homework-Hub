"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    setPending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not register. Check your inputs.",
      );
      return;
    }
    window.location.href = "/login";
  }

  return (
    <AuthShell>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Create account
      </h1>
      <p className="mt-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Password must be at least 8 characters.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Name (optional)
          <span className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-violet-100 bg-white py-2.5 pl-10 pr-3 text-slate-900 shadow-inner outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400"
            />
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Email
          <span className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-violet-100 bg-white py-2.5 pl-10 pr-3 text-slate-900 shadow-inner outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400"
            />
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Password
          <span className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-violet-100 bg-white py-2.5 pl-10 pr-3 text-slate-900 shadow-inner outline-none transition focus:border-violet-400 dark:border-violet-500/30 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400"
            />
          </span>
        </label>
        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-violet-600 underline decoration-violet-300 underline-offset-2 dark:text-violet-400"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
