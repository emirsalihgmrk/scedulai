import { ChevronRight, LogIn, NotebookPen } from "lucide-react";

import EmptyState from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MISTAKE_CATEGORY_LABELS } from "@/constants/mistake";
import type { MistakeCategory } from "@/constants/mistake";
import { formatDate, pluralize } from "@/lib/utils";
import type { MistakeListItem } from "@/schemas/mistake";
import { getCurrentUserService } from "@/services/auth";
import { getMistakesService } from "@/services/mistake";

import MistakeSummary from "./mistake-summary";

interface MistakeGroup {
  category: MistakeCategory;
  mistakes: MistakeListItem[];
}

// Most mistakes first; mistakes keep their newest-first order.
function groupByCategory(mistakes: MistakeListItem[]): MistakeGroup[] {
  const groups = new Map<MistakeCategory, MistakeListItem[]>();
  for (const mistake of mistakes) {
    groups.set(mistake.category, [
      ...(groups.get(mistake.category) ?? []),
      mistake,
    ]);
  }
  return [...groups.entries()]
    .map(([category, items]) => ({ category, mistakes: items }))
    .sort((a, b) => b.mistakes.length - a.mistakes.length);
}

export default async function MistakeNotebook() {
  const [user, mistakes] = await Promise.all([
    getCurrentUserService(),
    getMistakesService(),
  ]);

  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in to practice"
        description="Your saved words and the mistakes from your quizzes are kept in your account and drilled here every day."
      />
    );
  }

  if (mistakes.length === 0) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="No mistakes yet"
        description="Grammar mistakes from your section quizzes are collected here and drilled in your daily session."
      />
    );
  }

  const groups = groupByCategory(mistakes);

  return (
    <section aria-label="Mistake notebook" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            Mistake notebook
          </h2>
          <span className="text-sm text-muted-foreground">
            {pluralize(mistakes.length, "mistake")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your daily session drills the area you&apos;ve been getting wrong
          most lately.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {groups.map((group, index) => (
          <li key={group.category}>
            <MistakeGroupItem group={group} isDefaultOpen={index === 0} />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface MistakeGroupItemProps {
  group: MistakeGroup;
  isDefaultOpen: boolean;
}

function MistakeGroupItem({ group, isDefaultOpen }: MistakeGroupItemProps) {
  return (
    <Collapsible
      defaultOpen={isDefaultOpen}
      className="rounded-xl bg-card ring-1 ring-foreground/10"
    >
      <CollapsibleTrigger className="group/category flex w-full items-center justify-between gap-3 rounded-xl p-4 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-5">
        <span className="flex items-center gap-3">
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-data-panel-open/category:rotate-90" />
          <span className="font-display font-semibold text-foreground">
            {MISTAKE_CATEGORY_LABELS[group.category]}
          </span>
        </span>
        <Badge variant="secondary">{group.mistakes.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="grid grid-cols-1 gap-4 px-4 pb-4 sm:px-5 sm:pb-5 md:grid-cols-2">
          {group.mistakes.map((mistake) => (
            <li
              key={mistake.id}
              className="flex flex-col gap-3 rounded-lg bg-muted/30 p-4 ring-1 ring-foreground/5"
            >
              <time
                dateTime={mistake.createdAt.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDate(mistake.createdAt)}
              </time>
              <MistakeSummary mistake={mistake} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MistakeNotebookFallback() {
  return (
    <section aria-label="Mistake notebook" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="h-6 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
          >
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
          </li>
        ))}
      </ul>
    </section>
  );
}
