import {
  CircleCheck,
  Gauge,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";
import { QUIZ_PASS_ACCURACY, QuizStatus } from "@/constants/progress";
import { accuracyClasses } from "./utils";

export function OverviewStep({
  quiz,
  questions,
  answered,
  progress,
  status,
  isResetting,
  onStart,
  onRetry,
  onGoTo,
}: {
  quiz: QuizWithQuestions;
  questions: QuestionWithAnswer[];
  answered: number;
  progress: number;
  status: QuizStatus | null;
  isResetting: boolean;
  onStart: () => void;
  onRetry: () => void;
  onGoTo: (index: number) => void;
}) {
  const total = quiz.questions.length;
  const passed = status === "passed";
  const failed = status === "failed";
  const inProgress = !passed && !failed && answered > 0;

  const gradedQuestions = questions.filter((q) => q.answer !== null);
  const avgAccuracy =
    gradedQuestions.length > 0
      ? Math.round(
          gradedQuestions.reduce((sum, q) => sum + q.answer!.accuracy, 0) /
            gradedQuestions.length,
        )
      : null;

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
          {(passed || failed) && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                passed
                  ? "bg-success/12 text-success"
                  : "bg-warning/12 text-warning-foreground"
              }`}
            >
              {passed ? "Passed" : "Failed"}
            </span>
          )}
          <span className="text-[11px] font-medium text-muted-foreground">
            Pass mark {QUIZ_PASS_ACCURACY}%
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

        {avgAccuracy !== null && (
          <div
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${accuracyClasses(avgAccuracy)}`}
          >
            <span className="text-sm font-medium">Avg. accuracy</span>
            <span className="font-display text-lg font-bold tabular-nums">
              {avgAccuracy}%
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
                const isGraded = q.answer !== null;
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
                        {q.payload.sourceSentence}
                      </span>
                      {isGraded && (
                        <span
                          className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums ${accuracyClasses(q.answer!.accuracy)}`}
                        >
                          {q.answer!.accuracy}%
                        </span>
                      )}
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
          variant={failed ? "secondary" : "default"}
          disabled={total === 0 || isResetting}
          onClick={failed ? onRetry : onStart}
          className="h-12 w-full text-sm"
        >
          {isResetting
            ? "Resetting…"
            : passed
              ? "Completed"
              : failed
                ? "Retry quiz"
                : inProgress
                  ? "Continue"
                  : "Start practice"}
          {isResetting ? (
            <Loader2 data-icon="inline-end" className="animate-spin" />
          ) : passed ? (
            <CircleCheck data-icon="inline-end" />
          ) : failed ? (
            <RotateCcw data-icon="inline-end" />
          ) : (
            <ChevronRight data-icon="inline-end" />
          )}
        </Button>
      </div>
    </>
  );
}
