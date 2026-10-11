"use client";

import { FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState, useTransition } from "react";

import {
  completePracticeAction,
  generatePracticeByAiAction,
} from "@/actions/practice";
import EmptyState from "@/components/shared/empty-state";
import CompletedStep from "@/components/shared/quiz/completed-step";
import GeneratingStep from "@/components/shared/quiz/generating-step";
import QuestionSkeleton from "@/components/shared/quiz/question-skeleton";
import QuestionStep from "@/components/shared/quiz/question-step";
import { Card } from "@/components/ui/card";
import { getNativeLanguageLabel } from "@/constants/language";
import type { PracticeWithQuestions } from "@/schemas/practice";
import type { User } from "@/schemas/user";

interface PracticeCardProps {
  user: User;
  mistakeId: string;
  practicePromise: Promise<PracticeWithQuestions | null>;
  isCompletedPromise: Promise<boolean>;
}

function getQuestionIds(practice: PracticeWithQuestions | null): string[] {
  return practice?.questions.map((question) => question.id) ?? [];
}

export default function PracticeCard({
  user,
  mistakeId,
  practicePromise,
  isCompletedPromise,
}: PracticeCardProps) {
  const initialPractice = use(practicePromise);
  const isCompleted = use(isCompletedPromise);
  const [practice, setPractice] = useState(initialPractice);
  // Question ids still to be answered correctly; a miss moves its id to the end.
  // Answers aren't stored, so a completed practice reopens on its completed
  // step and an unfinished one starts over.
  const [queue, setQueue] = useState(() =>
    isCompleted ? [] : getQuestionIds(initialPractice),
  );
  // Bumped on every advance so a re-asked question remounts with a fresh draft.
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (practice || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    startTransition(async () => {
      try {
        const result = await generatePracticeByAiAction(mistakeId);
        if (result.ok) {
          setPractice(result.data);
          setQueue(getQuestionIds(result.data));
          setError(null);
        } else {
          setError(result.error);
          hasRequestedRef.current = false;
        }
      } catch {
        setError("An unexpected error occurred while generating the practice.");
        hasRequestedRef.current = false;
      }
    });
  }, [practice, mistakeId]);

  const handleContinue = (isCorrect: boolean) => {
    const [head, ...rest] = queue;
    const next = isCorrect ? rest : [...rest, head];
    setQueue(next);
    setAttempt((value) => value + 1);
    if (next.length === 0) {
      void completePracticeAction(mistakeId).then((result) => {
        if (result.ok) router.refresh();
      });
    }
  };

  if (error) {
    return (
      <div className="sticky top-20">
        <EmptyState
          icon={FileQuestion}
          title="Practice could not be prepared"
          description={error}
          className="h-[80vh]"
        />
      </div>
    );
  }

  if (isPending || !practice) {
    return (
      <GeneratingStep
        title="Practice is being prepared with AI"
        description="New sentences are being written around your mistake..."
      />
    );
  }

  const total = practice.questions.length;
  const question = practice.questions.find(({ id }) => id === queue[0]);

  return (
    <div className="sticky top-20">
      <Card
        aria-label="Mistake practice"
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
            sourceLabel="AI-generated for your mistake"
            onContinue={handleContinue}
          />
        ) : (
          <CompletedStep
            title="Practice completed"
            total={total}
            onRestart={() => setQueue(getQuestionIds(practice))}
          />
        )}
      </Card>
    </div>
  );
}

export function PracticeCardFallback() {
  return <QuestionSkeleton />;
}
