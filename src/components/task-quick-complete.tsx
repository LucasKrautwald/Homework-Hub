"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function TaskQuickComplete({
  taskId,
  isDone,
  className,
}: {
  taskId: string;
  isDone: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (isDone) {
    return (
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
          className,
        )}
        title="Done"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      title="Mark done"
      disabled={pending}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-violet-300 text-violet-500 transition hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-600 disabled:opacity-50 dark:border-violet-500/40 dark:hover:border-emerald-400",
        className,
      )}
    >
      <Check className="h-4 w-4" />
    </button>
  );
}
