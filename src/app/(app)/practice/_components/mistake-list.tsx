import {
  ChevronRight,
  CircleCheck,
  Dumbbell,
  LogIn,
  NotebookPen,
} from "lucide-react";
import Link from "next/link";

import EmptyState from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MISTAKE_CATEGORY_LABELS } from "@/constants/mistake";
import { formatDate } from "@/lib/utils";
import type { MistakeListItem } from "@/schemas/mistake";
import { getCurrentUserService } from "@/services/auth";
import { getMistakesService } from "@/services/mistake";

import MistakeSummary from "./mistake-summary";

export default async function MistakeList() {
  const [user, mistakes] = await Promise.all([
    getCurrentUserService(),
    getMistakesService(),
  ]);

  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in to practice"
        description="The mistakes from your quizzes are saved to your account so you can practice them here."
      />
    );
  }

  if (mistakes.length === 0) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="No mistakes yet"
        description="Grammar mistakes from your section quizzes show up here, ready to practice."
      />
    );
  }

  // The list is a to-do list: a practiced mistake moves out of it, but stays
  // reachable for another round.
  const pending = mistakes.filter((mistake) => !mistake.practice?.completedAt);
  const practiced = mistakes.filter((mistake) => mistake.practice?.completedAt);

  return (
    <section aria-label="Your mistakes" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">
          To practice
        </h2>
        <span className="text-sm text-muted-foreground">
          {pending.length} mistakes
        </span>
      </div>

      {pending.length > 0 ? (
        <MistakeGrid mistakes={pending} />
      ) : (
        <EmptyState
          icon={CircleCheck}
          title="All caught up"
          description="Every mistake has been practiced. New ones from your quizzes will show up here."
        />
      )}

      {practiced.length > 0 && (
        <Collapsible className="flex flex-col gap-4">
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="group/practiced self-start"
              />
            }
          >
            <ChevronRight
              data-icon="inline-start"
              className="transition-transform group-data-panel-open/practiced:rotate-90"
            />
            Practiced ({practiced.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <MistakeGrid mistakes={practiced} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  );
}

interface MistakeGridProps {
  mistakes: MistakeListItem[];
}

function MistakeGrid({ mistakes }: MistakeGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {mistakes.map((mistake) => (
        <MistakeItem key={mistake.id} mistake={mistake} />
      ))}
    </ul>
  );
}

interface MistakeItemProps {
  mistake: MistakeListItem;
}

function MistakeItem({ mistake }: MistakeItemProps) {
  const isPracticed = !!mistake.practice?.completedAt;

  return (
    <li className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {MISTAKE_CATEGORY_LABELS[mistake.category]}
          </Badge>
          {isPracticed && (
            <Badge className="bg-success/12 text-success">
              <CircleCheck data-icon="inline-start" />
              Practiced
            </Badge>
          )}
        </div>
        <time
          dateTime={mistake.createdAt.toISOString()}
          className="shrink-0 text-xs text-muted-foreground"
        >
          {formatDate(mistake.createdAt)}
        </time>
      </div>

      <MistakeSummary mistake={mistake} />

      <Button
        asChild
        size="sm"
        variant={isPracticed ? "outline" : "default"}
        className="mt-auto self-start"
      >
        <Link href={`/practice/${mistake.id}`}>
          <Dumbbell data-icon="inline-start" />
          {isPracticed ? "Practice again" : "Practice"}
        </Link>
      </Button>
    </li>
  );
}

export function MistakeListFallback() {
  return (
    <section aria-label="Your mistakes" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="h-6 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <li
            key={index}
            className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          </li>
        ))}
      </ul>
    </section>
  );
}
