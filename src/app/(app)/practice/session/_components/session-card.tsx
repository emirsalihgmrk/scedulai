"use client";

import { CircleCheck, FileQuestion } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  completePracticeAction,
  generatePracticeByAiAction,
} from "@/actions/practice";
import { savePracticeGlossAction } from "@/actions/vocabulary";
import EmptyState from "@/components/shared/empty-state";
import GeneratingStep from "@/components/shared/quiz/generating-step";
import QuestionStep from "@/components/shared/quiz/question-step";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getNativeLanguageLabel } from "@/constants/language";
import { MISTAKE_CATEGORY_LABELS } from "@/constants/mistake";
import type { MistakeCategory } from "@/constants/mistake";
import { pluralize } from "@/lib/utils";
import type { PracticeWithQuestions } from "@/schemas/practice";
import type { User } from "@/schemas/user";
import type { VocabularyItemListItem } from "@/schemas/vocabulary";

import WordsStep from "./words-step";

type Phase = "words" | "sentences" | "done";

interface SessionCardProps {
  user: User;
  items: VocabularyItemListItem[];
  newItemIds: string[];
  initialPractice: PracticeWithQuestions | null;
  targetCategory: MistakeCategory | null;
}

function getQuestionIds(practice: PracticeWithQuestions | null): string[] {
  return practice?.questions.map((question) => question.id) ?? [];
}

export default function SessionCard({
  user,
  items,
  newItemIds,
  initialPractice,
  targetCategory,
}: SessionCardProps) {
  const hasSentences = initialPractice
    ? !initialPractice.completedAt
    : targetCategory !== null;
  const [phase, setPhase] = useState<Phase>(() => {
    if (items.length > 0) return "words";
    return hasSentences ? "sentences" : "done";
  });
  const [practice, setPractice] = useState(initialPractice);
  // Question ids still to be answered correctly; a miss moves its id to the end.
  // Answers aren't stored, so an unfinished set starts over on reload.
  const [queue, setQueue] = useState(() => getQuestionIds(initialPractice));
  // Bumped on every advance so a re-asked question remounts with a fresh draft.
  const [attempt, setAttempt] = useState(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Starts with the session, so the set is ready by the time the words are done.
  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (practice || !hasSentences || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    startTransition(async () => {
      try {
        const result = await generatePracticeByAiAction();
        if (result.ok) {
          setPractice(result.data);
          setQueue(getQuestionIds(result.data));
          setError(null);
        } else {
          setError(result.error);
          hasRequestedRef.current = false;
        }
      } catch {
        setError("An unexpected error occurred while preparing the sentences.");
        hasRequestedRef.current = false;
      }
    });
  }, [practice, hasSentences]);

  const handleContinue = (isCorrect: boolean) => {
    const [head, ...rest] = queue;
    const next = isCorrect ? rest : [...rest, head];
    setQueue(next);
    setAttempt((value) => value + 1);
    if (next.length === 0) {
      setPhase("done");
      void completePracticeAction().then((result) => {
        if (!result.ok) setError(result.error);
      });
    }
  };

  const category = practice?.category ?? targetCategory;
  const categoryLabel = category ? MISTAKE_CATEGORY_LABELS[category] : null;

  if (phase === "sentences") {
    if (error) {
      return (
        <EmptyState
          icon={FileQuestion}
          title="Sentences could not be prepared"
          description={error}
          className="h-[80vh]"
        />
      );
    }
    if (isPending || !practice) {
      return (
        <GeneratingStep
          title="Your sentences are being prepared"
          description={
            categoryLabel
              ? `New sentences are being written around your ${categoryLabel.toLowerCase()} mistakes...`
              : "New sentences are being written around your mistakes..."
          }
        />
      );
    }
  }

  const question = practice?.questions.find(({ id }) => id === queue[0]);

  return (
    <Card
      aria-label="Today's session"
      className="relative flex h-[80vh] min-h-128 flex-col gap-0 overflow-hidden py-0"
    >
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />

      {phase === "words" && (
        <WordsStep
          items={items}
          newItemIds={newItemIds}
          error={reviewError}
          onError={setReviewError}
          onComplete={() => setPhase(hasSentences ? "sentences" : "done")}
        />
      )}

      {phase === "sentences" && practice && question && (
        <QuestionStep
          key={`${question.id}-${attempt}`}
          question={question}
          solved={practice.questions.length - queue.length}
          total={practice.questions.length}
          nativeLangLabel={getNativeLanguageLabel(user.nativeLanguage)}
          sourceLabel={`Your weakest area: ${categoryLabel}`}
          onContinue={handleContinue}
          onSaveGloss={(gloss) =>
            savePracticeGlossAction(question.id, {
              phrase: gloss.phrase,
            }).then((result) => result.ok)
          }
        />
      )}

      {phase === "done" && (
        <DoneStep
          wordCount={items.length}
          sentenceCount={hasSentences ? (practice?.questions.length ?? 0) : 0}
          categoryLabel={hasSentences ? categoryLabel : null}
          error={reviewError ?? error}
        />
      )}
    </Card>
  );
}

interface DoneStepProps {
  wordCount: number;
  sentenceCount: number;
  categoryLabel: string | null;
  error: string | null;
}

function DoneStep({
  wordCount,
  sentenceCount,
  categoryLabel,
  error,
}: DoneStepProps) {
  const details = [
    wordCount > 0 && pluralize(wordCount, "word"),
    sentenceCount > 0 && pluralize(sentenceCount, "sentence"),
    categoryLabel,
  ].filter(Boolean);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-success/12 text-success">
        <CircleCheck className="size-8" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-lg font-semibold text-foreground">
          Done for today
        </p>
        <p className="text-sm text-muted-foreground">{details.join(" · ")}</p>
        <p className="text-sm text-muted-foreground">
          Your words come back when they&apos;re due, and tomorrow brings new
          sentences for your weakest area.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button asChild variant="secondary">
        <Link href="/practice">Back to practice</Link>
      </Button>
    </div>
  );
}
