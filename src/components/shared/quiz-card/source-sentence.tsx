import { Sparkles } from "lucide-react";
import { Fragment } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Gloss, Question } from "@/schemas/quiz";

interface SourceSentenceProps {
  question: Question;
  label: string;
}

interface SentenceSegment {
  text: string;
  gloss: Gloss | null;
}

// Glosses come from the model, so a phrase that isn't in the sentence verbatim,
// or overlaps an earlier one, is skipped rather than trusted.
function splitByGlosses(sentence: string, glosses: Gloss[]): SentenceSegment[] {
  const matches = glosses
    .flatMap((gloss) => {
      const start = gloss.phrase ? sentence.indexOf(gloss.phrase) : -1;
      return start === -1
        ? []
        : [{ start, end: start + gloss.phrase.length, gloss }];
    })
    .sort((a, b) => a.start - b.start);

  const segments: SentenceSegment[] = [];
  let cursor = 0;
  for (const { start, end, gloss } of matches) {
    if (start < cursor) continue;
    if (start > cursor) {
      segments.push({ text: sentence.slice(cursor, start), gloss: null });
    }
    segments.push({ text: sentence.slice(start, end), gloss });
    cursor = end;
  }
  if (cursor < sentence.length) {
    segments.push({ text: sentence.slice(cursor), gloss: null });
  }
  return segments;
}

export default function SourceSentence({ question, label }: SourceSentenceProps) {
  const { sourceSentence, glosses = [] } = question.payload;
  const segments = splitByGlosses(sourceSentence, glosses);

  return (
    <div className="rounded-xl bg-secondary/70 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        {label}
      </div>
      <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
        {segments.map((segment, index) =>
          segment.gloss ? (
            <Popover key={index}>
              <PopoverTrigger
                openOnHover
                delay={150}
                className="cursor-help underline decoration-muted-foreground/60 decoration-dotted decoration-2 underline-offset-4 transition-colors hover:decoration-primary data-popup-open:decoration-primary"
              >
                {segment.text}
              </PopoverTrigger>
              <PopoverContent side="top" className="w-auto max-w-64 px-3 py-2">
                <span className="font-medium">{segment.gloss.meaning}</span>
              </PopoverContent>
            </Popover>
          ) : (
            <Fragment key={index}>{segment.text}</Fragment>
          ),
        )}
      </p>
    </div>
  );
}
