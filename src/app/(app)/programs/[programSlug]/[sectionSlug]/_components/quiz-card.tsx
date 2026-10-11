"use client";

import { FileQuestion, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState, useTransition } from "react";

import { completeQuizAction, generateQuizByAiAction } from "@/actions/quiz";
import { saveQuizGlossAction } from "@/actions/vocabulary";
import EmptyState from "@/components/shared/empty-state";
import CompletedStep from "@/components/shared/quiz/completed-step";
import GeneratingStep from "@/components/shared/quiz/generating-step";
import QuestionSkeleton from "@/components/shared/quiz/question-skeleton";
import QuestionStep from "@/components/shared/quiz/question-step";
import { Card } from "@/components/ui/card";
import { getNativeLanguageLabel } from "@/constants/language";
import type { QuizWithQuestions } from "@/schemas/quiz";
import type { User } from "@/schemas/user";

interface QuizCardProps {
  user: User | null;
  sectionId: string;
  quizPromise: Promise<QuizWithQuestions | null>;
  isCompletedPromise: Promise<boolean>;
}

function getQuestionIds(quiz: QuizWithQuestions | null): string[] {
  return quiz?.questions.map((question) => question.id) ?? [];
}

export default function QuizCard({
  user,
  sectionId,
  quizPromise,
  isCompletedPromise,
}: QuizCardProps) {
  const initialQuiz = use(quizPromise);
  const isCompleted = use(isCompletedPromise);
  const [quiz, setQuiz] = useState(initialQuiz);
  // Question ids still to be answered correctly; a miss moves its id to the end.
  // Answers aren't stored, so a completed quiz reopens on its completed step
  // and an unfinished one starts over.
  const [queue, setQueue] = useState(() =>
    isCompleted ? [] : getQuestionIds(initialQuiz),
  );
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

  if (isPending || !quiz) {
    return (
      <GeneratingStep
        title="Quiz is being prepared with AI"
        description="Personalized translation sentences are being generated from your transcript..."
      />
    );
  }

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
            sourceLabel="AI-generated from transcript"
            onContinue={handleContinue}
            onSaveGloss={(gloss) =>
              saveQuizGlossAction(sectionId, question.id, {
                phrase: gloss.phrase,
              }).then((result) => result.ok)
            }
          />
        ) : (
          <CompletedStep
            title="Quiz completed"
            total={total}
            onRestart={() => setQueue(getQuestionIds(quiz))}
          />
        )}
      </Card>
    </div>
  );
}

export function QuizCardFallback() {
  return <QuestionSkeleton />;
}
