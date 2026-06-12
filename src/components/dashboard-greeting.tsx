"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function phraseForHour(h: number) {
  if (h >= 6 && h < 12) return "Buenos días";
  if (h >= 12 && h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function DashboardGreeting({
  displayName,
}: {
  displayName?: string | null;
}) {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setPhrase(phraseForHour(now.getHours()));
    setUpdatedAt(
      now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    );
  }, []);

  const first =
    displayName?.trim().split(/\s+/)[0] ??
    displayName?.trim() ??
    null;
  const line =
    phrase && first ? `${phrase}, ${first}` : phrase ?? null;

  return (
    <div>
      <h1
        className="bg-gradient-to-r from-violet-300 via-fuchsia-100 to-white bg-clip-text text-3xl font-extrabold tracking-tight text-transparent"
        aria-live="polite"
      >
        {line ?? (
          <span
            className="invisible bg-gradient-to-r from-violet-300 via-fuchsia-100 to-white bg-clip-text"
            aria-hidden
          >
            Buenos días
          </span>
        )}
      </h1>
      <p
        className={
          updatedAt
            ? "mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"
            : "invisible mt-1.5 text-xs"
        }
      >
        <Clock className="h-3 w-3" aria-hidden />
        Última actualización {updatedAt ?? "00:00"}
      </p>
    </div>
  );
}
