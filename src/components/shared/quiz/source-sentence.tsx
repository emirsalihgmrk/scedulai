import { Sparkles } from "lucide-react";

import GlossedText from "@/components/shared/quiz/glossed-text";
import type { Gloss, Question } from "@/schemas/quiz";

interface SourceSentenceProps {
  question: Question;
  label: string;
  onSaveGloss?: (gloss: Gloss) => Promise<boolean>;
}

// Only the English lemma while translating: the form the sentence needs is
// what the learner has to produce.
export default function SourceSentence({
  question,
  label,
  onSaveGloss,
}: SourceSentenceProps) {
  const { sourceSentence, glosses = [] } = question.payload;

  return (
    <div className="rounded-xl bg-secondary/70 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        {label}
      </div>
      <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
        <GlossedText
          text={sourceSentence}
          glosses={glosses}
          form="nativeInContext"
          renderHint={(gloss) => (
            <span className="font-medium">{gloss.englishLemma}</span>
          )}
          onSaveGloss={onSaveGloss}
        />
      </p>
    </div>
  );
}
