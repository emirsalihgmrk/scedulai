"use client";

import { useState, useTransition } from "react";
import {
  Gauge,
  Languages,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionWithAnswer } from "@/schemas/quiz";
import { submitAnswerAction } from "@/actions/quiz";
import { AnswerInput } from "./answer-input";
import { GradedQuestion } from "./graded-question";

export function QuestionStep({
  question,
  index,
  total,
  nativeLangLabel,
  targetLangLabel,
  value,
  onChange,
  onOverview,
  onPrev,
  onNext,
  onGraded,
}: {
  question: QuestionWithAnswer;
  index: number;
  total: number;
  nativeLangLabel: string;
  targetLangLabel: string;
  value: string;
  onChange: (value: string) => void;
  onOverview: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGraded: (question: QuestionWithAnswer) => void;
}) {
  const [sourceLang, targetLang] =
    question.direction === "native-to-target"
      ? [nativeLangLabel, targetLangLabel]
      : [targetLangLabel, nativeLangLabel];
  const isLast = index === total;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const isGraded = question.answer !== null;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitAnswerAction(question.id, {
          type: "translation",
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
    <>
      <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-primary/10 text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Question {index} / {total}
          </Badge>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Languages className="size-3.5" />
          {sourceLang}
          <ArrowRight className="size-3" />
          {targetLang}
        </span>
      </div>

      {isGraded ? (
        <GradedQuestion
          question={question}
          flipped={flipped}
          onFlip={setFlipped}
        />
      ) : (
        <AnswerInput
          question={question}
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        />
      )}

      {/* Navigation between questions on the same card */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-5 sm:p-6">
        <Button
          type="button"
          variant="outline"
          onClick={onOverview}
          className="gap-1.5"
        >
          <Gauge data-icon="inline-start" />
          Overview
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={index === 1}
            className="gap-1.5"
          >
            <ChevronLeft data-icon="inline-start" />
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onNext}
            disabled={isLast}
            className="gap-1.5"
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </>
  );
}
