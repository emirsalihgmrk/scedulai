import { BookMarked, Clapperboard, LogIn } from "lucide-react";

import EmptyState from "@/components/shared/empty-state";
import { formatDate, formatDuration } from "@/lib/utils";
import type { VocabularyItemListItem } from "@/schemas/vocabulary";
import { getCurrentUserService } from "@/services/auth";
import { getVocabularyItemsService } from "@/services/vocabulary";

import DeleteVocabularyItemButton from "./delete-vocabulary-item-button";

export default async function VocabularyList() {
  const [user, items] = await Promise.all([
    getCurrentUserService(),
    getVocabularyItemsService(),
  ]);

  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in to build your vocabulary"
        description="Words you save from transcripts and quizzes are kept in your account."
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookMarked}
        title="No saved words yet"
        description="Save a word from a section's transcript, or from a hint while you translate."
      />
    );
  }

  return (
    <section aria-label="Saved words" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">
          Saved words
        </h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "word" : "words"}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <VocabularyItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

interface VocabularyItemProps {
  item: VocabularyItemListItem;
}

function VocabularyItem({ item }: VocabularyItemProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-foreground">
            {item.phrase}
          </p>
          <p className="text-sm text-muted-foreground">{item.meaning}</p>
        </div>
        <DeleteVocabularyItemButton
          vocabularyItemId={item.id}
          phrase={item.phrase}
        />
      </div>

      <p className="rounded-lg bg-muted/60 p-3 text-[13px] italic leading-relaxed text-foreground/90">
        {item.context}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
        {item.video ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <Clapperboard className="size-3.5 shrink-0" />
            <span className="truncate">{item.video.title}</span>
            {item.timeSeconds !== null && (
              <span className="shrink-0 tabular-nums">
                · {formatDuration(item.timeSeconds)}
              </span>
            )}
          </span>
        ) : (
          <span />
        )}
        <time dateTime={item.createdAt.toISOString()} className="shrink-0">
          {formatDate(item.createdAt)}
        </time>
      </div>
    </li>
  );
}

export function VocabularyListFallback() {
  return (
    <section aria-label="Saved words" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            key={index}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
          >
            <div className="flex flex-col gap-2">
              <div className="h-6 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-14 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </li>
        ))}
      </ul>
    </section>
  );
}
