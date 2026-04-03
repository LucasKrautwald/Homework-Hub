"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this homework item?")) return;
    setPending(true);
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setPending(false);
    router.push("/tasks");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={onDelete}
      className="gap-1.5"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
