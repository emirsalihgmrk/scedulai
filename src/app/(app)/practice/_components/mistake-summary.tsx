import { ArrowRight } from "lucide-react";

import type { Mistake } from "@/schemas/mistake";

interface MistakeSummaryProps {
  mistake: Mistake;
}

export default function MistakeSummary({ mistake }: MistakeSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-lg leading-snug font-semibold">
          <span className="text-destructive line-through decoration-destructive/60 decoration-2">
            {mistake.incorrect}
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="sr-only">corrected to</span>
          <span className="text-success">{mistake.correction}</span>
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {mistake.explanation}
        </p>
      </div>

      <dl className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Sentence
          </dt>
          <dd className="text-sm text-foreground">{mistake.sourceSentence}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Your answer
          </dt>
          <dd className="text-sm text-foreground">{mistake.userTranslation}</dd>
        </div>
      </dl>
    </div>
  );
}
