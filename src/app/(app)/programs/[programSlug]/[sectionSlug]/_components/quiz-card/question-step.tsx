"use client";

import { ArrowRight, ChevronRight, Languages } from "lucide-react";
import { useState, useTransition } from "react";

import { gradeTranslationAction } from "@/actions/quiz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Question, TranslationGrade } from "@/schemas/quiz";

import AnswerInput from "./answer-input";
import GradedQuestion from "./graded-question";

interface QuestionStepProps {
  question: Question;
  solved: number;
  total: number;
  nativeLangLabel: string;
  targetLangLabel: string;
  onContinue: (isCorrect: boolean) => void;
}

export default function QuestionStep({
  question,
  solved,
  total,
  nativeLangLabel,
  targetLangLabel,
  onContinue,
}: QuestionStepProps) {
  const [sourceLang, targetLang] =
    question.direction === "native-to-target"
      ? [nativeLangLabel, targetLangLabel]
      : [targetLangLabel, nativeLangLabel];
  const [draft, setDraft] = useState("");
  const [grade, setGrade] = useState<TranslationGrade | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await gradeTranslationAction(question.id, {
          userTranslation: draft,
        });
        if (result.ok) {
          setGrade(result.data);
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
      <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Badge className="gap-1.5 bg-primary/10 text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {solved} / {total} correct
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Languages className="size-3.5" />
            {sourceLang}
            <ArrowRight className="size-3" />
            {targetLang}
          </span>
        </div>
        <Progress
          value={total === 0 ? 0 : (solved / total) * 100}
          aria-label="Quiz progress"
          className="**:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-primary **:data-[slot=progress-indicator]:to-chart-5 **:data-[slot=progress-track]:h-2"
        />
      </div>

      {grade ? (
        <GradedQuestion
          question={question}
          grade={grade}
          isFlipped={isFlipped}
          onFlip={setIsFlipped}
        />
      ) : (
        <AnswerInput
          question={question}
          value={draft}
          onChange={setDraft}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        />
      )}

      {grade && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">
            {grade.isCorrect
              ? "Nice work, on to the next one."
              : "This sentence will come back at the end."}
          </p>
          <Button
            type="button"
            onClick={() => onContinue(grade.isCorrect)}
            className="gap-1.5"
          >
            Continue
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      )}
    </>
  );
}
