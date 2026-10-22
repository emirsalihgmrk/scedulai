import { ArrowRight, BookmarkPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RECALL_WINDOW_DAYS } from "@/constants/progress";
import { cn, pluralize } from "@/lib/utils";
import { getVocabularyProgressService } from "@/services/progress";

import { formatDay, formatPercent } from "./format";

// Ordered stages of one hue: the darker, the further along.
const STAGES = [
  { key: "unreviewed", label: "New", className: "bg-primary/25" },
  { key: "learning", label: "Learning", className: "bg-primary/55" },
  { key: "learned", label: "Learned", className: "bg-primary" },
] as const;

export default async function VocabularyProgress() {
  const progress = await getVocabularyProgressService();
  if (!progress) return null;

  const dueToday = progress.dueForecast[0]?.count ?? 0;
  const forecastMax = Math.max(
    ...progress.dueForecast.map((day) => day.count),
    1,
  );

  return (
    <Card aria-labelledby="vocabulary-title" className="h-full">
      <CardHeader className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <CardTitle
          id="vocabulary-title"
          className="font-display text-lg font-bold"
        >
          Words
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {pluralize(progress.saved, "word")} saved
        </span>
      </CardHeader>

      {progress.saved === 0 ? (
        <CardContent className="flex flex-1 flex-col items-start justify-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookmarkPlus className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Select words in a transcript or a quiz hint to save them. They come
            back for review right before you&apos;d forget them.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/programs">Find a video</Link>
          </Button>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div
              role="img"
              aria-label={STAGES.map(
                (stage) => `${progress[stage.key]} ${stage.label.toLowerCase()}`,
              ).join(", ")}
              className="flex h-3 gap-0.5 overflow-hidden rounded-full"
            >
              {STAGES.map((stage) =>
                progress[stage.key] > 0 ? (
                  <div
                    key={stage.key}
                    className={cn("h-full", stage.className)}
                    style={{ flexGrow: progress[stage.key] }}
                  />
                ) : null,
              )}
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {STAGES.map((stage) => (
                <div key={stage.key} className="flex flex-col gap-0.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className={cn("size-2.5 rounded-full", stage.className)}
                    />
                    {stage.label}
                  </dt>
                  <dd className="font-display text-xl font-bold text-foreground tabular-nums">
                    {progress[stage.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                Coming up
              </span>
              <span className="text-xs text-muted-foreground">
                {progress.recallRate === null
                  ? "No reviews yet"
                  : `${formatPercent(progress.recallRate)} remembered in ${RECALL_WINDOW_DAYS} days`}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {progress.dueForecast.map((day, index) => (
                <div
                  key={day.day}
                  role="group"
                  className="flex flex-col items-center gap-1"
                  aria-label={`${index === 0 ? "Today" : formatDay(day.day, { weekday: "long" })}: ${pluralize(day.count, "word")} due`}
                >
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {day.count}
                  </span>
                  <div className="flex h-10 w-full items-end rounded-sm bg-muted">
                    <div
                      className="w-full rounded-sm bg-primary/70"
                      style={{ height: `${(day.count / forecastMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {index === 0
                      ? "Today"
                      : formatDay(day.day, { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {(dueToday > 0 || progress.unreviewed > 0) && (
            <Button asChild size="sm" className="self-start">
              <Link href="/practice/session">
                Review words
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function VocabularyProgressFallback() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
