import { Sparkles } from "lucide-react";

import type { Question } from "@/schemas/quiz";

interface SourceSentenceProps {
  question: Question;
  label: string;
}

export default function SourceSentence({ question, label }: SourceSentenceProps) {
  return (
    <div className="rounded-xl bg-secondary/70 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        {label}
      </div>
      <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
        {question.payload.sourceSentence}
      </p>
    </div>
  );
}
