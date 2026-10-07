"use client";

import { FileQuestion, Gauge, LogIn } from "lucide-react";
import { use, useEffect, useReducer, useRef, useTransition } from "react";

import {
  evaluateQuizAction,
  generateQuizByAiAction,
  retryQuizAction,
} from "@/actions/quiz";
import EmptyState from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { getUserLanguageLabels } from "@/constants/language";
import { QUIZ_PASS_ACCURACY  } from "@/constants/progress";
import type {QuizStatus} from "@/constants/progress";
import type { QuizWithQuestions } from "@/schemas/quiz";
import type { User } from "@/schemas/user";

import GeneratingStep from "./generating-step";
import OverviewStep from "./overview-step";
import QuestionStep from "./question-step";
import { createInitialState, quizReducer } from "./reducer";

interface QuizCardProps {
  user: User | null;
  sectionId: string;
  quizPromise: Promise<QuizWithQuestions | null>;
}

export default function QuizCard({
  user,
  sectionId,
  quizPromise,
}: QuizCardProps) {
  const [state, dispatch] = useReducer(
    quizReducer,
    use(quizPromise),
    createInitialState,
  );
  const { quiz, step, answers, error, isResetting } = state;
  const [isPending, startTransition] = useTransition();

  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (!user || quiz || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    startTransition(async () => {
      try {
        const result = await generateQuizByAiAction(sectionId);
        if (result.ok) dispatch({ type: "generated", quiz: result.data });
        else {
          dispatch({ type: "failed", error: result.error });
          hasRequestedRef.current = false;
        }
      } catch {
        dispatch({
          type: "failed",
          error: "An unexpected error occurred while generating the quiz.",
        });
        hasRequestedRef.current = false;
      }
    });
  }, [user, quiz, sectionId]);

  const lastEvaluatedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user || !quiz || quiz.questions.length === 0) return;
    if (quiz.questions.some((q) => q.answer === null)) return;

    const signature = quiz.questions.map((q) => q.answer!.accuracy).join(",");
    if (lastEvaluatedRef.current === signature) return;
    lastEvaluatedRef.current = signature;

    void evaluateQuizAction(sectionId);
  }, [user, quiz, sectionId]);

  const handleRetry = () => {
    lastEvaluatedRef.current = null;
    dispatch({ type: "retryStarted" });
    retryQuizAction(sectionId)
      .then((result) => {
        dispatch({
          type: "retrySettled",
          error: result.ok ? undefined : result.error,
        });
      })
      .catch(() => dispatch({ type: "retrySettled" }));
  };

  if (error) {
    return (
      <div className="sticky top-20">
        <EmptyState
          icon={FileQuestion}
          title="Quiz could not be prepared"
          description={error}
          className="h-[80vh]"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="sticky top-20">
        <EmptyState
          icon={LogIn}
          title="Sign in for the quiz"
          description="You need to sign in to your account to take this section's quiz."
          className="h-[80vh]"
        />
      </div>
    );
  }

  if (isPending || !quiz) return <GeneratingStep />;

  const questions = quiz.questions;
  const total = questions.length;
  const answered = questions.filter((q) => q.answer !== null).length;
  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  const isAllGraded = total > 0 && answered === total;
  const quizStatus: QuizStatus | null = isAllGraded
    ? Math.round(
        questions.reduce((sum, q) => sum + q.answer!.accuracy, 0) / total,
      ) >= QUIZ_PASS_ACCURACY
      ? "passed"
      : "failed"
    : null;

  // Resume at the first unanswered question when the quiz is mid-progress.
  const firstUnansweredIndex = questions.findIndex((q) => q.answer === null);
  const resumeStep = firstUnansweredIndex === -1 ? 1 : firstUnansweredIndex + 1;

  const isOverview = step === 0;
  const question = isOverview ? undefined : questions[step - 1];

  const { nativeLangLabel, targetLangLabel } = getUserLanguageLabels(user);
  return (
    <div className="sticky top-20">
      <Card
        aria-label="Translation quiz"
        className="relative flex h-[80vh] flex-col gap-0 overflow-hidden py-0"
      >
        {/* Active accent bar (shown while answering a question) */}
        {!isOverview && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />
        )}

        {isOverview || !question ? (
          <OverviewStep
            questions={questions}
            answered={answered}
            progress={progress}
            status={quizStatus}
            isResetting={isResetting}
            onStart={() => dispatch({ type: "navigate", step: resumeStep })}
            onRetry={handleRetry}
            onGoTo={(index) => dispatch({ type: "navigate", step: index })}
          />
        ) : (
          <QuestionStep
            key={question.id}
            question={question}
            index={step}
            total={total}
            nativeLangLabel={nativeLangLabel}
            targetLangLabel={targetLangLabel}
            value={answers[question.id] ?? ""}
            onChange={(value) =>
              dispatch({
                type: "answerChanged",
                questionId: question.id,
                value,
              })
            }
            onOverview={() => dispatch({ type: "navigate", step: 0 })}
            onPrev={() => dispatch({ type: "navigate", step: step - 1 })}
            onNext={() =>
              dispatch({ type: "navigate", step: Math.min(step + 1, total) })
            }
            onGraded={(q) => dispatch({ type: "graded", question: q })}
          />
        )}
      </Card>
    </div>
  );
}

export function QuizCardFallback() {
  return (
    <div className="sticky top-20">
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 p-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Gauge className="size-5 text-muted-foreground/40" />
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 pt-2">
          {/* Stat boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 animate-pulse rounded-xl bg-muted" />
            <div className="h-11 animate-pulse rounded-xl bg-muted" />
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 animate-pulse rounded-full bg-muted" />
          </div>

          {/* Question list */}
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
            <div className="flex flex-col gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border px-3.5 py-3"
                >
                  <span className="mt-0.5 size-5 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer button */}
        <div className="shrink-0 border-t border-border p-5 sm:p-6">
          <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
