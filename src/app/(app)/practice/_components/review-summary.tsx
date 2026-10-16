import { BookMarked, ChevronRight, CircleCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUserService } from "@/services/auth";
import {
  getDueVocabularyItemsService,
  getNewVocabularyItemsService,
} from "@/services/vocabulary";

function pluralizeWords(count: number): string {
  return `${count} ${count === 1 ? "word" : "words"}`;
}

export default async function ReviewSummary() {
  const [user, dueItems, newItems] = await Promise.all([
    getCurrentUserService(),
    getDueVocabularyItemsService(),
    getNewVocabularyItemsService(),
  ]);

  // The mistake list below already asks guests to sign in.
  if (!user) return null;

  const total = dueItems.length + newItems.length;
  const details = [
    dueItems.length > 0 && `${pluralizeWords(dueItems.length)} due`,
    newItems.length > 0 && `${pluralizeWords(newItems.length)} new`,
  ].filter(Boolean);

  return (
    <section
      aria-label="Word review"
      className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {total > 0 ? (
            <BookMarked className="size-6" />
          ) : (
            <CircleCheck className="size-6" />
          )}
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-lg font-bold text-foreground">
            {total > 0
              ? `${pluralizeWords(total)} to review`
              : "No words to review"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {total > 0
              ? details.join(" · ")
              : "Saved words come back here when they're due."}
          </p>
        </div>
      </div>

      {total > 0 && (
        <Button asChild className="self-start sm:self-auto">
          <Link href="/practice/review">
            Start review
            <ChevronRight data-icon="inline-end" />
          </Link>
        </Button>
      )}
    </section>
  );
}

export function ReviewSummaryFallback() {
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
