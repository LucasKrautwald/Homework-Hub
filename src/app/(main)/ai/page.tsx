import { AiChat } from "@/components/ai-chat";

export default function AiPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          Asistente de estudio
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Planifica, repasa y organiza tu trabajo con ayuda de la IA.
        </p>
      </div>
      <AiChat />
    </div>
  );
}
