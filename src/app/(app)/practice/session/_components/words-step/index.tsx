"use client";

import { Sparkles } from "lucide-react";
import { useRef, useState } from "react";

import { reviewVocabularyItemAction } from "@/actions/vocabulary";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  ReviewVocabularyItemInput,
  VocabularyItemListItem,
} from "@/schemas/vocabulary";

import PromptStep from "./prompt-step";
import ResultStep from "./result-step";
import { isCorrectAnswer } from "./utils";

interface WordsStepProps {
  items: VocabularyItemListItem[];
  newItemIds: string[];
  error: string | null;
  onError: (error: string) => void;
  onComplete: () => void;
}

export default function WordsStep({
  items,
  newItemIds,
  error,
  onError,
  onComplete,
}: WordsStepProps) {
  // Item ids still to be answered correctly; a miss moves its id to the end.
  const [queue, setQueue] = useState(() => items.map(({ id }) => id));
  // Bumped on every advance so a re-asked word remounts with a fresh draft.
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  // Only a word's first answer in the session is scheduled; a re-ask is
  // practice and is not sent again.
  const reviewedRef = useRef(new Set<string>());

  const total = items.length;
  const item = items.find(({ id }) => id === queue[0]);
  if (!item) return null;

  const handleContinue = (rating: ReviewVocabularyItemInput["rating"]) => {
    if (!reviewedRef.current.has(item.id)) {
      reviewedRef.current.add(item.id);
      void reviewVocabularyItemAction(item.id, { rating })
        .then((result) => {
          if (!result.ok) onError(result.error);
        })
        .catch(() => onError("Your answer could not be saved."));
    }

    const [head, ...rest] = queue;
    const next = rating === "good" ? rest : [...rest, head];
    setQueue(next);
    setAttempt((value) => value + 1);
    setDraft("");
    setSubmitted(null);
    if (next.length === 0) onComplete();
  };

  return (
    <>
      <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Badge className="gap-1.5 bg-primary/10 text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {total - queue.length} / {total} words
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
          aria-label="Word review progress"
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
  );
}
