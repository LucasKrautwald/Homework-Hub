"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    setPhrase(phraseForHour(new Date().getHours()));
  }, []);

  const first =
    displayName?.trim().split(/\s+/)[0] ??
    displayName?.trim() ??
    null;
  const line =
    phrase && first ? `${phrase}, ${first}` : phrase ?? null;

  return (
    <h1
      className="text-3xl font-extrabold tracking-tight text-white"
      aria-live="polite"
    >
      {line ?? (
        <span className="invisible" aria-hidden>
          Buenos días
        </span>
      )}
    </h1>
  );
}
