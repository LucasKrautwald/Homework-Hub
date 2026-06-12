"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setPending(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name.trim() }),
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
      <h1 className="text-center text-2xl font-semibold tracking-tight text-white">
        Create account
      </h1>
      <p className="mt-2 text-center text-sm text-slate-400">
        Password must be at least 8 characters.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
          Nombre
          <span className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
          Email
          <span className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
          Password
          <span className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </span>
        </label>
        {error ? (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600/90 via-violet-500/90 to-violet-600/90 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:via-violet-400/90 hover:to-violet-500 disabled:opacity-60"
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
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-violet-400 transition hover:text-violet-300"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
