"use client";

import { CircleCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { reviewVocabularyItemAction } from "@/actions/vocabulary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  ReviewVocabularyItemInput,
  VocabularyItemListItem,
} from "@/schemas/vocabulary";

import PromptStep from "./prompt-step";
import ResultStep from "./result-step";
import { isCorrectAnswer } from "./utils";

interface ReviewCardProps {
  items: VocabularyItemListItem[];
  newItemIds: string[];
}

export default function ReviewCard({ items, newItemIds }: ReviewCardProps) {
  // Item ids still to be answered correctly; a miss moves its id to the end.
  const [queue, setQueue] = useState(() => items.map(({ id }) => id));
  // Bumped on every advance so a re-asked word remounts with a fresh draft.
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Only a word's first answer in the session is scheduled; a re-ask is
  // practice and is not sent again.
  const reviewedRef = useRef(new Set<string>());

  const total = items.length;
  const item = items.find(({ id }) => id === queue[0]);

  const handleContinue = (rating: ReviewVocabularyItemInput["rating"]) => {
    if (!item) return;
    if (!reviewedRef.current.has(item.id)) {
      reviewedRef.current.add(item.id);
      void reviewVocabularyItemAction(item.id, { rating })
        .then((result) => {
          if (!result.ok) setError(result.error);
        })
        .catch(() => setError("Your answer could not be saved."));
    }

    const [head, ...rest] = queue;
    setQueue(rating === "good" ? rest : [...rest, head]);
    setAttempt((value) => value + 1);
    setDraft("");
    setSubmitted(null);
  };

  return (
    <Card
      aria-label="Word review"
      className="relative flex min-h-[32rem] flex-col gap-0 overflow-hidden py-0"
    >
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />

      {item ? (
        <>
          <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-6 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <Badge className="gap-1.5 bg-primary/10 text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                {total - queue.length} / {total} done
              </Badge>
              {newItemIds.includes(item.id) && (
                <Badge variant="secondary">
                  <Sparkles data-icon="inline-start" />
                  New word
                </Badge>
              )}
            </div>
            <Progress
              value={total === 0 ? 0 : ((total - queue.length) / total) * 100}
              aria-label="Review progress"
              className="**:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-primary **:data-[slot=progress-indicator]:to-chart-5 **:data-[slot=progress-track]:h-2"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {submitted === null ? (
            <PromptStep
              key={`${item.id}-${attempt}`}
              item={item}
              value={draft}
              onChange={setDraft}
              onSubmit={() => setSubmitted(draft.trim())}
            />
          ) : (
            <ResultStep
              key={`${item.id}-${attempt}`}
              item={item}
              answer={submitted}
              isCorrect={isCorrectAnswer(submitted, item)}
              onContinue={handleContinue}
            />
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-success/12 text-success">
            <CircleCheck className="size-8" />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-lg font-semibold text-foreground">
              Review complete
            </p>
            <p className="text-sm text-muted-foreground">
              You got all {total} {total === 1 ? "word" : "words"} right. Each
              one comes back when it&apos;s due.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button asChild variant="secondary">
            <Link href="/practice">Back to practice</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
