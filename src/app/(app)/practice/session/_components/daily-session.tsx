import { CircleCheck, LogIn } from "lucide-react";

import EmptyState from "@/components/shared/empty-state";
import { getCurrentUserService } from "@/services/auth";
import {
  getPracticeService,
  getPracticeTargetService,
} from "@/services/practice";
import {
  getDueVocabularyItemsService,
  getNewVocabularyItemsService,
} from "@/services/vocabulary";

import SessionCard from "./session-card";

export default async function DailySession() {
  const [user, dueItems, newItems, practice, target] = await Promise.all([
    getCurrentUserService(),
    getDueVocabularyItemsService(),
    getNewVocabularyItemsService(),
    getPracticeService(),
    getPracticeTargetService(),
  ]);

  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in for your daily session"
        description="Your saved words and the mistakes from your quizzes come back here every day."
      />
    );
  }

  const hasSentences = practice ? !practice.completedAt : target !== null;
  if (dueItems.length === 0 && newItems.length === 0 && !hasSentences) {
    return (
      <EmptyState
        icon={CircleCheck}
        title="All caught up"
        description="No words are due and there are no new mistakes to drill. Take a section quiz, or come back tomorrow."
      />
    );
  }

  // Due words first: they are the ones being forgotten.
  return (
    <SessionCard
      user={user}
      items={[...dueItems, ...newItems]}
      newItemIds={newItems.map(({ id }) => id)}
      initialPractice={practice}
      targetCategory={target?.category ?? null}
    />
  );
}

export function DailySessionFallback() {
  return (
    <div className="flex h-[80vh] min-h-[32rem] flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
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
