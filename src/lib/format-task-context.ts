type TaskLike = {
  title: string;
  subject?: string | null;
  dueAt: string | Date;
  priority: string;
  category?: string;
  status?: string;
};

export function formatPendingTasksContext(tasks: TaskLike[]): string {
  const pending = tasks.filter((t) => t.status !== "DONE");
  if (pending.length === 0) {
    return "Eres un asistente de estudio. El estudiante no tiene tareas pendientes en este momento. Usa este contexto para dar respuestas personalizadas.";
  }

  const list = pending
    .map((t) => {
      const due = new Intl.DateTimeFormat("es", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(t.dueAt));
      const subject = t.subject?.trim() || "sin materia";
      const category = t.category ?? "short";
      return `- ${t.title} (materia: ${subject}, vence: ${due}, prioridad: ${t.priority}, tipo: ${category})`;
    })
    .join("\n");

  return `Eres un asistente de estudio. El estudiante tiene estas tareas pendientes:\n${list}\nUsa este contexto para dar respuestas personalizadas.`;
}
