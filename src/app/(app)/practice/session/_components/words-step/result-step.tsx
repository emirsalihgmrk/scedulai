import {
  ChevronRight,
  CircleCheck,
  CircleX,
  Clapperboard,
  PencilLine,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type {
  ReviewVocabularyItemInput,
  VocabularyItemListItem,
} from "@/schemas/vocabulary";

import { splitContext } from "./utils";

const VERDICT_CLASSES = {
  correct: "bg-success/12 text-success",
  incorrect: "bg-warning/12 text-warning-foreground",
} as const;

interface ResultStepProps {
  item: VocabularyItemListItem;
  answer: string;
  isCorrect: boolean;
  onContinue: (rating: ReviewVocabularyItemInput["rating"]) => void;
}

export default function ResultStep({
  item,
  answer,
  isCorrect,
  onContinue,
}: ResultStepProps) {
  const parts = splitContext(item.context, item.contextPhrase);
  const VerdictIcon = isCorrect ? CircleCheck : CircleX;
  const sentenceForm =
    item.contextPhrase && item.contextPhrase !== item.phrase
      ? item.contextPhrase
      : null;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 sm:px-6">
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <PencilLine className="size-3.5" />
              Your answer
            </div>
            <p className="break-words text-[15px] leading-relaxed text-foreground">
              {answer}
            </p>
          </div>
          <span
            className={cn(
              "flex shrink-0 flex-col items-center rounded-xl px-3 py-2",
              VERDICT_CLASSES[isCorrect ? "correct" : "incorrect"],
            )}
          >
            <VerdictIcon className="size-5" />
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {isCorrect ? "Correct" : "Incorrect"}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-success/30 bg-success/8 p-4">
          <div>
            <p className="font-display text-xl font-bold text-foreground">
              {item.phrase}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.meaning}
              {sentenceForm && <> · “{sentenceForm}” in the sentence</>}
            </p>
          </div>

          <p className="text-[15px] italic leading-relaxed text-foreground/90">
            {parts ? (
              <>
                {parts.before}
                <mark className="rounded bg-success/20 px-0.5 font-semibold not-italic text-foreground">
                  {parts.phrase}
                </mark>
                {parts.after}
              </>
            ) : (
              item.context
            )}
          </p>

          {item.video && (
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Clapperboard className="size-3.5 shrink-0" />
              <span className="truncate">{item.video.title}</span>
              {item.timeSeconds !== null && (
                <span className="shrink-0 tabular-nums">
                  · {formatDuration(item.timeSeconds)}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          {isCorrect
            ? "You'll see this word again when it's due."
            : "This word will come back at the end."}
        </p>
        <div className="flex gap-2">
          {!isCorrect && (
            // For a synonym or a typo the check can't tell apart.
            <Button
              type="button"
              variant="outline"
              onClick={() => onContinue("good")}
            >
              <ThumbsUp data-icon="inline-start" />I was right
            </Button>
          )}
          <Button
            type="button"
            autoFocus
            onClick={() => onContinue(isCorrect ? "good" : "again")}
          >
            Continue
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </>
  );
}
