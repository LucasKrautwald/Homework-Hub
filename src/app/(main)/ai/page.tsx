import { AiChat } from "@/components/ai-chat";

export default function AiPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-violet-300 dark:via-fuchsia-400 dark:to-cyan-400">
          Study assistant
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Powered by your OpenAI key. Add{" "}
          <code className="rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
            OPENAI_API_KEY
          </code>{" "}
          to <code className="rounded-lg bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-100">.env</code>{" "}
          to enable replies.
        </p>
      </div>
      <AiChat />
    </div>
  );
}
