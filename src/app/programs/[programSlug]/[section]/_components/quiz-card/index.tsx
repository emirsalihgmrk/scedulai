"use client";

import { use, useEffect, useReducer, useRef, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { QuizWithQuestions } from "@/schemas/quiz";
import { OverviewStep } from "./overview-step";
import { QuestionStep } from "./question-step";
import { QuizGenerating } from "./fallback";
import { createInitialState, quizReducer } from "./reducer";
import { getUserLanguageLabels } from "@/constants/language";
import { FileQuestion, LogIn } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  evaluateQuizAction,
  generateQuizByAiAction,
  retryQuizAction,
} from "@/actions/quiz";
import { User } from "@/schemas/auth";
import { QUIZ_PASS_ACCURACY, QuizStatus } from "@/constants/progress";

export function QuizCard({
  user,
  sectionId,
  quizPromise,
}: {
  user: User | null;
  sectionId: string;
  quizPromise: Promise<QuizWithQuestions | null>;
}) {
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

  if (isPending || !quiz) return <QuizGenerating />;

  const total = quiz.questions.length;
  const questions = quiz.questions;
  const answered = questions.filter((q) => q.answer !== null).length;
  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  const allGraded = total > 0 && answered === total;
  const quizStatus: QuizStatus | null = allGraded
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
        className={`relative flex h-[80vh] flex-col gap-0 overflow-hidden py-0`}
      >
        {/* Active accent bar (shown while answering a question) */}
        {!isOverview && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />
        )}

        {isOverview || !question ? (
          <OverviewStep
            quiz={quiz}
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
