"use client";

import { use, useEffect, useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";
import { OverviewStep } from "./overview-step";
import { QuestionStep } from "./question-step";
import { QuizGenerating } from "./fallback";
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
  const initialQuiz = use(quizPromise);

  const [quiz, setQuiz] = useState(initialQuiz);
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, QuestionWithAnswer>>({});

  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (!user || quiz || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    startTransition(async () => {
      try {
        const result = await generateQuizByAiAction(sectionId);
        if (result.ok) setQuiz(result.data);
        else {
          setError(result.error);
          hasRequestedRef.current = false;
        }
      } catch {
        setError("An unexpected error occurred while generating the quiz.");
        hasRequestedRef.current = false;
      }
    });
  }, [user, quiz, sectionId]);

  const lastEvaluatedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user || !quiz || quiz.questions.length === 0) return;

    const merged = quiz.questions.map((q) => graded[q.id] ?? q);
    if (merged.some((q) => q.answer === null)) return;

    const signature = merged.map((q) => q.answer!.accuracy).join(",");
    if (lastEvaluatedRef.current === signature) return;
    lastEvaluatedRef.current = signature;

    void evaluateQuizAction(sectionId);
  }, [user, quiz, graded, sectionId]);

  const handleRetry = () => {
    setGraded({});
    setAnswers({});
    lastEvaluatedRef.current = null;
    setStep(0);
    setQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) => ({ ...q, answer: null })),
          }
        : prev,
    );

    setIsResetting(true);
    retryQuizAction(sectionId)
      .then((result) => {
        if (!result.ok) setError(result.error);
      })
      .finally(() => setIsResetting(false));
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
  const questions = quiz.questions.map((q) => graded[q.id] ?? q);
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
            onStart={() => setStep(resumeStep)}
            onRetry={handleRetry}
            onGoTo={setStep}
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
              setAnswers((prev) => ({ ...prev, [question.id]: value }))
            }
            onOverview={() => setStep(0)}
            onPrev={() => setStep((s) => s - 1)}
            onNext={() => setStep((s) => Math.min(s + 1, total))}
            onGraded={(q) => setGraded((prev) => ({ ...prev, [q.id]: q }))}
          />
        )}
      </Card>
    </div>
  );
}
