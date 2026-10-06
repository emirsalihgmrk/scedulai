import { CircleCheck, CircleX } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  FillInTheBlankPayload,
  FillInTheBlankResult,
  QuestionWithAnswer,
} from "@/schemas/quiz";

import { getAccuracyClasses } from "../utils";
import { indexSegments } from "./blank-answers";
import FillInTheBlankPrompt from "./fill-in-the-blank-prompt";

interface FillInTheBlankGradedProps {
  question: QuestionWithAnswer;
  payload: FillInTheBlankPayload;
  result: FillInTheBlankResult;
  accuracy: number;
}

const BLANK_CLASSES = {
  correct: "border-success bg-success/12 text-success",
  incorrect: "border-destructive bg-destructive/10 text-destructive",
};

export default function FillInTheBlankGraded({
  payload,
  result,
  accuracy,
}: FillInTheBlankGradedProps) {
  const segments = indexSegments(payload.segments);
  const { answers } = result.response;
  const { blankResults } = result.analysis;
  const correctCount = blankResults.filter(Boolean).length;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 sm:px-6">
      <FillInTheBlankPrompt payload={payload} />

      <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4">
        <p className="min-w-0 text-pretty text-lg leading-loose text-foreground">
          {segments.map((segment, i) =>
            segment.kind === "text" ? (
              <span key={i}>{segment.value}</span>
            ) : (
              <span
                key={i}
                className={cn(
                  "mx-1 inline-flex items-center rounded-lg border-b-2 px-2.5 py-0.5 font-medium",
                  blankResults[segment.index]
                    ? BLANK_CLASSES.correct
                    : BLANK_CLASSES.incorrect,
                )}
              >
                {answers[segment.index]}
              </span>
            ),
          )}
        </p>
        <span
          className={cn(
            "flex shrink-0 flex-col items-center rounded-xl px-3 py-2",
            getAccuracyClasses(accuracy),
          )}
        >
          <span className="font-display text-lg font-bold leading-none">
            {accuracy}%
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
            Accuracy
          </span>
        </span>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {correctCount} / {blankResults.length} correct
        </p>
        <ul className="space-y-1.5">
          {segments.map((segment) =>
            segment.kind === "blank" ? (
              <li
                key={segment.index}
                className="flex items-center gap-2 text-[13px] leading-relaxed text-foreground/90"
              >
                {blankResults[segment.index] ? (
                  <CircleCheck className="size-4 shrink-0 text-success" />
                ) : (
                  <CircleX className="size-4 shrink-0 text-destructive" />
                )}
                <span className="font-medium">{segment.answer}</span>
                {!blankResults[segment.index] && (
                  <span className="text-muted-foreground">
                    (you wrote “{answers[segment.index]}”)
                  </span>
                )}
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </div>
  );
}
