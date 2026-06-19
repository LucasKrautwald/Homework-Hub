type TaskLike = {
  title: string;
  subject?: string | null;
  dueAt: string | Date;
  priority: string;
  category?: string;
  status?: string;
};

export function formatPendingTasksContext(tasks: TaskLike[]): string {
  if (tasks.length === 0) {
    return "El estudiante no tiene ninguna tarea registrada. Si pide un plan personalizado, dilo explícitamente y ofrece ayuda general o crear la primera tarea.";
  }

  const pending = tasks.filter((t) => t.status !== "DONE");
  if (pending.length === 0) {
    return "El estudiante tiene tareas pero ninguna pendiente. Usa este contexto para personalizar respuestas.";
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

  return `Tareas pendientes del estudiante:\n${list}\nResponde en su idioma. Sé conciso y específico con sus tareas.`;
}
