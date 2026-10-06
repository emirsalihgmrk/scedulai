"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { submitFillInTheBlankAnswerAction } from "@/actions/quiz";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  FillInTheBlankPayload,
  QuestionWithAnswer,
} from "@/schemas/quiz";

import {
  indexSegments,
  parseBlankAnswers,
  serializeBlankAnswers,
} from "./blank-answers";
import FillInTheBlankPrompt from "./fill-in-the-blank-prompt";

interface FillInTheBlankInputProps {
  question: QuestionWithAnswer;
  payload: FillInTheBlankPayload;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}

// Marks which pool chips the current answers consume. Matching by occurrence
// (not by word) keeps duplicate words in the pool independently selectable.
function getUsedPoolIndexes(
  wordPool: string[],
  answers: string[],
): Set<number> {
  const used = new Set<number>();
  for (const answer of answers) {
    if (answer === "") continue;
    const poolIndex = wordPool.findIndex(
      (word, i) => word === answer && !used.has(i),
    );
    if (poolIndex !== -1) used.add(poolIndex);
  }
  return used;
}

// Ungraded fill-in-the-blank question: owns its submission (action call +
// pending / error state) so the generic question step stays type-agnostic.
export default function FillInTheBlankInput({
  question,
  payload,
  value,
  onChange,
  onGraded,
}: FillInTheBlankInputProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const segments = indexSegments(payload.segments);
  const blankCount = segments.filter((s) => s.kind === "blank").length;
  const answers = parseBlankAnswers(value, blankCount);
  const usedPoolIndexes = getUsedPoolIndexes(payload.wordPool, answers);
  const isComplete = answers.length > 0 && answers.every((a) => a !== "");

  function handlePick(word: string) {
    const firstEmpty = answers.indexOf("");
    if (firstEmpty === -1) return;
    onChange(
      serializeBlankAnswers(
        answers.map((answer, i) => (i === firstEmpty ? word : answer)),
      ),
    );
  }

  function handleClear(blankIndex: number) {
    onChange(
      serializeBlankAnswers(
        answers.map((answer, i) => (i === blankIndex ? "" : answer)),
      ),
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitFillInTheBlankAnswerAction(question.id, {
          answers,
        });
        if (result.ok) {
          onGraded(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Evaluation failed, please try again.");
      }
    });
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-5 sm:px-6">
      <FillInTheBlankPrompt payload={payload} />

      <p className="text-pretty text-lg leading-loose text-foreground">
        {segments.map((segment, i) =>
          segment.kind === "text" ? (
            <span key={i}>{segment.value}</span>
          ) : (
            <button
              key={i}
              type="button"
              disabled={isPending || answers[segment.index] === ""}
              onClick={() => handleClear(segment.index)}
              aria-label={
                answers[segment.index] === ""
                  ? `Blank ${segment.index + 1}, empty`
                  : `Blank ${segment.index + 1}: ${answers[segment.index]}. Press to clear`
              }
              className={cn(
                "mx-1 inline-flex min-w-20 items-center justify-center rounded-lg border-b-2 px-2.5 py-0.5 align-baseline font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                answers[segment.index] === ""
                  ? "border-border bg-muted text-transparent"
                  : "border-primary bg-primary/10 text-primary hover:bg-primary/15",
              )}
            >
              {answers[segment.index] === "" ? "___" : answers[segment.index]}
            </button>
          ),
        )}
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Word pool">
        {payload.wordPool.map((word, i) => (
          <Button
            key={i}
            type="button"
            variant="outline"
            disabled={isPending || usedPoolIndexes.has(i) || isComplete}
            onClick={() => handlePick(word)}
          >
            {word}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        disabled={!isComplete || isPending}
        onClick={handleSubmit}
        className="h-12 w-full text-sm"
      >
        {isPending ? (
          <>
            <Loader2 data-icon="inline-start" className="animate-spin" />
            Grading…
          </>
        ) : (
          <>
            <Sparkles data-icon="inline-start" />
            Submit Answer
          </>
        )}
      </Button>
    </div>
  );
}
