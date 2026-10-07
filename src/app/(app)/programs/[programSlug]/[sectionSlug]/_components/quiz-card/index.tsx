"use client";

import { FileQuestion, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState, useTransition } from "react";

import { completeQuizAction, generateQuizByAiAction } from "@/actions/quiz";
import EmptyState from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { getNativeLanguageLabel } from "@/constants/language";
import type { QuizWithQuestions } from "@/schemas/quiz";
import type { User } from "@/schemas/user";

import CompletedStep from "./completed-step";
import GeneratingStep from "./generating-step";
import QuestionStep from "./question-step";

interface QuizCardProps {
  user: User | null;
  sectionId: string;
  quizPromise: Promise<QuizWithQuestions | null>;
}

function getQuestionIds(quiz: QuizWithQuestions | null): string[] {
  return quiz?.questions.map((question) => question.id) ?? [];
}

export default function QuizCard({
  user,
  sectionId,
  quizPromise,
}: QuizCardProps) {
  const initialQuiz = use(quizPromise);
  const [quiz, setQuiz] = useState(initialQuiz);
  // Question ids still to be answered correctly; a miss moves its id to the end.
  const [queue, setQueue] = useState(() => getQuestionIds(initialQuiz));
  // Bumped on every advance so a re-asked question remounts with a fresh draft.
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (!user || quiz || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    startTransition(async () => {
      try {
        const result = await generateQuizByAiAction(sectionId);
        if (result.ok) {
          setQuiz(result.data);
          setQueue(getQuestionIds(result.data));
          setError(null);
        } else {
          setError(result.error);
          hasRequestedRef.current = false;
        }
      } catch {
        setError("An unexpected error occurred while generating the quiz.");
        hasRequestedRef.current = false;
      }
    });
  }, [user, quiz, sectionId]);

  const handleContinue = (isCorrect: boolean) => {
    const [head, ...rest] = queue;
    const next = isCorrect ? rest : [...rest, head];
    setQueue(next);
    setAttempt((value) => value + 1);
    if (next.length === 0) {
      void completeQuizAction(sectionId).then((result) => {
        if (result.ok) router.refresh();
      });
    }
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

  const total = quiz.questions.length;
  const question = quiz.questions.find(({ id }) => id === queue[0]);

  return (
    <div className="sticky top-20">
      <Card
        aria-label="Translation quiz"
        className="relative flex h-[80vh] flex-col gap-0 overflow-hidden py-0"
      >
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />

        {question ? (
          <QuestionStep
            key={`${question.id}-${attempt}`}
            question={question}
            solved={total - queue.length}
            total={total}
            nativeLangLabel={getNativeLanguageLabel(user.nativeLanguage)}
            onContinue={handleContinue}
          />
        ) : (
          <CompletedStep
            total={total}
            onRestart={() => setQueue(getQuestionIds(quiz))}
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
        <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-2 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 sm:px-6">
          {/* Source sentence */}
          <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-4">
            <div className="h-2.5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          </div>

          {/* Answer field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-md bg-muted" />
          </div>

          {/* Submit button */}
          <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
