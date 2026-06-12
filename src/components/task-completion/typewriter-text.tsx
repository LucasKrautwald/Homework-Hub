"use client";

import { useEffect, useState } from "react";

export function TypewriterText({ text }: { text: string }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplay("");
      return;
    }
    setDisplay("");
    let i = 0;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(text);
      return;
    }
    const id = window.setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
      {display}
      {display.length < text.length ? (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-400" />
      ) : null}
    </p>
  );
}
