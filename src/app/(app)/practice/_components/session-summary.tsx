import { ChevronRight, CircleCheck, Dumbbell } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MISTAKE_CATEGORY_LABELS } from "@/constants/mistake";
import { pluralize } from "@/lib/utils";
import { getCurrentUserService } from "@/services/auth";
import {
  getPracticeService,
  getPracticeTargetService,
} from "@/services/practice";
import {
  getDueVocabularyItemsService,
  getNewVocabularyItemsService,
} from "@/services/vocabulary";

export default async function SessionSummary() {
  const [user, dueItems, newItems, practice, target] = await Promise.all([
    getCurrentUserService(),
    getDueVocabularyItemsService(),
    getNewVocabularyItemsService(),
    getPracticeService(),
    getPracticeTargetService(),
  ]);

  // The mistake notebook below already asks guests to sign in.
  if (!user) return null;

  const wordCount = dueItems.length + newItems.length;
  // Today's set if there is one, otherwise the one the session would make.
  const sentences = practice
    ? !practice.completedAt && {
        label: pluralize(practice.questions.length, "sentence"),
        category: practice.category,
      }
    : target && { label: "New sentences", category: target.category };
  const hasWork = wordCount > 0 || !!sentences;

  const details = [
    wordCount > 0 && pluralize(wordCount, "word"),
    sentences && sentences.label,
    sentences && MISTAKE_CATEGORY_LABELS[sentences.category],
  ].filter(Boolean);

  return (
    <section
      aria-label="Today's session"
      className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {hasWork ? (
            <Dumbbell className="size-6" />
          ) : (
            <CircleCheck className="size-6" />
          )}
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-lg font-bold text-foreground">
            {hasWork
              ? "Today's session"
              : practice
                ? "Done for today"
                : "Nothing to practice yet"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasWork
              ? details.join(" · ")
              : practice
                ? "Come back tomorrow for new sentences."
                : "Save words and take section quizzes; they come back here."}
          </p>
        </div>
      </div>

      {hasWork && (
        <Button asChild className="self-start sm:self-auto">
          <Link href="/practice/session">
            Start session
            <ChevronRight data-icon="inline-end" />
          </Link>
        </Button>
      )}
    </section>
  );
}

export function SessionSummaryFallback() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="size-12 shrink-0 animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
