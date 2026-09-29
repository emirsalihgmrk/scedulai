"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  Loader2,
  CircleCheck,
  PencilLine,
  RotateCcw,
  ChevronLeft,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import type {
  QuestionWithAnswer,
  TranslationPayload,
  TranslationResult,
} from "@/schemas/quiz";
import { submitTranslationAnswerAction } from "@/actions/quiz";
import { accuracyClasses } from "../utils";
import { QuestionPrompt } from ".";

export function TranslationPrompt({
  payload,
}: {
  payload: TranslationPayload;
}) {
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

// Ungraded translation question: owns its submission (action call + pending /
// error state) so the generic question step stays type-agnostic.
export function TranslationInput({
  question,
  value,
  onChange,
  onGraded,
}: {
  question: QuestionWithAnswer;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitTranslationAnswerAction(question.id, {
          userTranslation: value,
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
      <QuestionPrompt question={question} />

      <Field>
        <FieldLabel htmlFor={`translation-${question.id}`}>
          Your translation
        </FieldLabel>
        <Textarea
          id={`translation-${question.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Type your English translation here..."
          className="resize-none"
          disabled={isPending}
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        disabled={value.trim().length === 0 || isPending}
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
            Submit Translation
          </>
        )}
      </Button>
    </div>
  );
}

export function GradedTranslationQuestion({
  question,
  payload,
  result,
  accuracy,
}: {
  question: QuestionWithAnswer;
  payload: TranslationPayload;
  result: TranslationResult;
  accuracy: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const userTranslation = result.response.userTranslation;

  return (
    <div className="relative min-h-0 flex-1 perspective-distant">
      <div
        className={`relative size-full transition-transform duration-500 transform-3d ${
          flipped ? "transform-[rotateY(180deg)]" : ""
        }`}
      >
        {/* Front — kept question + answer + accuracy */}
        <div className="absolute inset-0 flex flex-col gap-4 overflow-y-auto px-5 backface-hidden sm:px-6">
          <QuestionPrompt question={question} />

          <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <PencilLine className="size-3.5" />
                Your translation
              </div>
              <p className="text-[15px] leading-relaxed text-foreground">
                {userTranslation}
              </p>
            </div>
            <span
              className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 ${accuracyClasses(accuracy)}`}
            >
              <span className="font-display text-lg font-bold leading-none">
                {accuracy}%
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Accuracy
              </span>
            </span>
          </div>

          <div className="rounded-xl border border-success/30 bg-success/8 p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
              <CircleCheck className="size-3.5" />
              Original Sentence
            </div>
            <p className="text-[15px] leading-relaxed text-foreground">
              {payload.expectedTranslation}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setFlipped(true)}
            className="gap-1.5"
          >
            <RotateCcw data-icon="inline-start" />
            Show AI analysis
          </Button>
        </div>

        {/* Back — full AI analysis */}
        <div className="absolute inset-0 flex flex-col gap-3 overflow-y-auto px-5 pb-5 backface-hidden transform-[rotateY(180deg)] sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-4" />
              AI Grammar &amp; Style Analysis
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 font-display text-sm font-bold ${accuracyClasses(accuracy)}`}
            >
              {accuracy}%
            </span>
          </div>

          {result.analysis.description && (
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {result.analysis.description}
            </p>
          )}

          {result.analysis.mistakes.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-destructive">
                Mistakes ({result.analysis.mistakes.length})
              </p>
              <ul className="space-y-1.5">
                {result.analysis.mistakes.map((mistake, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[13px] leading-relaxed text-foreground/90"
                  >
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.analysis.alternatives.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="size-3.5" />
                Alternative phrasings
              </div>
              <ul className="space-y-1">
                {result.analysis.alternatives.map((alt, i) => (
                  <li
                    key={i}
                    className="text-[13px] leading-relaxed text-foreground/90 before:mr-1.5 before:text-muted-foreground before:content-['·']"
                  >
                    {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setFlipped(false)}
            className="mt-1 gap-1.5 self-start"
          >
            <ChevronLeft data-icon="inline-start" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
