import { CircleCheck, LogIn } from "lucide-react";

import EmptyState from "@/components/shared/empty-state";
import { getCurrentUserService } from "@/services/auth";
import {
  getDueVocabularyItemsService,
  getNewVocabularyItemsService,
} from "@/services/vocabulary";

import ReviewCard from "./review-card";

export default async function ReviewSession() {
  const [user, dueItems, newItems] = await Promise.all([
    getCurrentUserService(),
    getDueVocabularyItemsService(),
    getNewVocabularyItemsService(),
  ]);

  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in to review your words"
        description="Words you save from transcripts and quizzes come back here to review."
      />
    );
  }

  if (dueItems.length === 0 && newItems.length === 0) {
    return (
      <EmptyState
        icon={CircleCheck}
        title="All caught up"
        description="No words are due right now. Each saved word comes back here when it's time to review it."
      />
    );
  }

  // Due words first: they are the ones being forgotten.
  return (
    <ReviewCard
      items={[...dueItems, ...newItems]}
      newItemIds={newItems.map(({ id }) => id)}
    />
  );
}

export function ReviewSessionFallback() {
  return (
    <div className="flex min-h-[32rem] flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-2 animate-pulse rounded-full bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-20 animate-pulse rounded-xl bg-muted/60" />
      <div className="mt-auto h-12 animate-pulse rounded-lg bg-muted" />
      <div className="h-12 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
