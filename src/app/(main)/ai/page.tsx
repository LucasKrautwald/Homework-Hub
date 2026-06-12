import { AiChat } from "@/components/ai-chat";

export default function AiPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          Study assistant
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Powered by your OpenAI key. Add{" "}
          <code className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-xs text-violet-300">
            OPENAI_API_KEY
          </code>{" "}
          to{" "}
          <code className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-xs text-cyan-300">
            .env
          </code>{" "}
          to enable replies.
        </p>
      </div>
      <AiChat />
    </div>
  );
}
