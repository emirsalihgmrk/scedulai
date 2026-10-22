import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CEFR_LEVELS } from "@/constants/learning";
import {
  LEVEL_MIN_ANSWERS,
  LEVEL_PASS_RATIO,
  LEVEL_WINDOW_DAYS,
} from "@/constants/progress";
import { cn } from "@/lib/utils";
import { getLevelEstimateService } from "@/services/progress";

import { formatPercent } from "./format";

export default async function LevelEstimate() {
  const estimate = await getLevelEstimateService();
  if (!estimate) return null;

  const estimateIndex = estimate.estimate
    ? CEFR_LEVELS.indexOf(estimate.estimate)
    : -1;
  const { next } = estimate;

  return (
    <Card id="level" aria-labelledby="level-title" className="h-full">
      <CardHeader>
        <CardTitle id="level-title" className="font-display text-lg font-bold">
          Level
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ol
          aria-label={`Estimated level: ${estimate.estimate ?? "not measured yet"}`}
          className="grid grid-cols-6 gap-1"
        >
          {CEFR_LEVELS.map((level, index) => (
            <li key={level} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-full rounded-full",
                  index <= estimateIndex
                    ? "bg-primary"
                    : index === estimateIndex + 1
                      ? "bg-primary/25"
                      : "bg-muted",
                )}
              />
              <span
                aria-current={index === estimateIndex ? "step" : undefined}
                className={cn(
                  "text-xs",
                  index === estimateIndex
                    ? "font-bold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {level}
              </span>
            </li>
          ))}
        </ol>

        {next ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">
                On your way to {next.level}
              </p>
              <p className="text-sm text-muted-foreground">
                Answer {LEVEL_MIN_ANSWERS} sentences from {next.level} videos
                and get {formatPercent(LEVEL_PASS_RATIO)} right on the first
                try. Answers from the last {LEVEL_WINDOW_DAYS} days count.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Sentences</span>
                <span className="font-medium text-foreground tabular-nums">
                  {Math.min(next.answers, LEVEL_MIN_ANSWERS)} /{" "}
                  {LEVEL_MIN_ANSWERS}
                </span>
              </div>
              <Progress
                aria-label={`${next.level} sentences answered`}
                value={Math.min(100, (next.answers / LEVEL_MIN_ANSWERS) * 100)}
                className="h-1.5"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Right first try
                </span>
                <span className="font-medium text-foreground tabular-nums">
                  {next.accuracy === null ? "–" : formatPercent(next.accuracy)}{" "}
                  / {formatPercent(LEVEL_PASS_RATIO)}
                </span>
              </div>
              <Progress
                aria-label={`${next.level} first-try accuracy`}
                value={
                  next.accuracy === null
                    ? 0
                    : Math.min(100, (next.accuracy / LEVEL_PASS_RATIO) * 100)
                }
                className="h-1.5"
              />
            </div>

            <Button asChild size="sm" variant="outline" className="self-start">
              <Link href="/programs">
                Find {next.level} videos
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
            <Trophy className="size-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              You&apos;re at the top of the scale. Keep your skills sharp with
              new videos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LevelEstimateFallback() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
