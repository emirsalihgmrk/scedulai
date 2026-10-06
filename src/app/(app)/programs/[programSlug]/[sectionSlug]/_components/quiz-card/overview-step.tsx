import {
  ChevronRight,
  CircleCheck,
  CircleX,
  Gauge,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QUIZ_PASS_RATIO } from "@/constants/progress";
import type {QuizStatus} from "@/constants/progress";
import { cn } from "@/lib/utils";
import type { QuestionWithAnswer } from "@/schemas/quiz";

import { getQuestionPreview } from "./question-types/question-preview";

interface OverviewStepProps {
  questions: QuestionWithAnswer[];
  answered: number;
  progress: number;
  status: QuizStatus | null;
  isResetting: boolean;
  onStart: () => void;
  onRetry: () => void;
  onGoTo: (index: number) => void;
}

export default function OverviewStep({
  questions,
  answered,
  progress,
  status,
  isResetting,
  onStart,
  onRetry,
  onGoTo,
}: OverviewStepProps) {
  const total = questions.length;
  const isPassed = status === "passed";
  const isFailed = status === "failed";
  const isInProgress = !isPassed && !isFailed && answered > 0;

  const passMark = Math.ceil(total * QUIZ_PASS_RATIO);
  const correct = questions.filter((q) => q.answer?.isCorrect).length;
  const isOnTrack = answered > 0 && correct / answered >= QUIZ_PASS_RATIO;

  return (
    <>
      <CardHeader className="shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2.5 pt-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Gauge className="size-5" />
        </span>
        <div className="leading-tight">
          <CardTitle className="font-display">Translation Quiz</CardTitle>
          <CardDescription className="text-xs">
            Generated from this talk
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          {(isPassed || isFailed) && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                isPassed
                  ? "bg-success/12 text-success"
                  : "bg-warning/12 text-warning-foreground",
              )}
            >
              {isPassed ? "Passed" : "Failed"}
            </span>
          )}
          <span className="text-[11px] font-medium text-muted-foreground">
            Pass mark {passMark} / {total}
          </span>
        </div>
      </CardHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums">
              {answered} / {total}
            </span>
          </div>
          <Progress
            value={progress}
            className="**:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-primary **:data-[slot=progress-indicator]:to-chart-5 **:data-[slot=progress-track]:h-2"
          />
        </div>

        {answered > 0 && (
          <div
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3",
              isOnTrack
                ? "bg-success/12 text-success"
                : "bg-warning/12 text-warning-foreground",
            )}
          >
            <span className="text-sm font-medium">Correct answers</span>
            <span className="font-display text-lg font-bold tabular-nums">
              {correct} / {answered}
            </span>
          </div>
        )}

        {questions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Questions
            </p>
            <ul className="flex flex-col gap-1.5">
              {questions.map((q, i) => {
                const { answer } = q;
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => onGoTo(i + 1)}
                      className="flex w-full items-start gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left transition-colors hover:bg-muted/60"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-[13px] leading-snug text-foreground/80">
                        {getQuestionPreview(q.payload)}
                      </span>
                      {answer &&
                        (answer.isCorrect ? (
                          <CircleCheck
                            aria-label="Correct"
                            className="mt-0.5 size-4 shrink-0 text-success"
                          />
                        ) : (
                          <CircleX
                            aria-label="Incorrect"
                            className="mt-0.5 size-4 shrink-0 text-destructive"
                          />
                        ))}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-5 sm:p-6">
        <Button
          type="button"
          size="lg"
          variant={isFailed ? "secondary" : "default"}
          disabled={total === 0 || isResetting}
          onClick={isFailed ? onRetry : onStart}
          className="h-12 w-full text-sm"
        >
          {isResetting
            ? "Resetting…"
            : isPassed
              ? "Completed"
              : isFailed
                ? "Retry quiz"
                : isInProgress
                  ? "Continue"
                  : "Start practice"}
          {isResetting ? (
            <Loader2 data-icon="inline-end" className="animate-spin" />
          ) : isPassed ? (
            <CircleCheck data-icon="inline-end" />
          ) : isFailed ? (
            <RotateCcw data-icon="inline-end" />
          ) : (
            <ChevronRight data-icon="inline-end" />
          )}
        </Button>
      </div>
    </>
  );
}
