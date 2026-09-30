import { Sparkles } from "lucide-react";

import type { TranslationPayload } from "@/schemas/quiz";

interface TranslationPromptProps {
  payload: TranslationPayload;
}

export default function TranslationPrompt({ payload }: TranslationPromptProps) {
  return (
    <div className="rounded-xl bg-secondary/70 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        AI-generated from transcript
      </div>
      <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
        {payload.sourceSentence}
      </p>
    </div>
  );
}
