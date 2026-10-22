import { ArrowRight, Languages } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MISTAKE_CATEGORY_LABELS } from "@/constants/mistake";
import { TREND_WEEKS } from "@/constants/progress";
import type { CategoryTrend } from "@/schemas/progress";
import { getAccuracyTrendsService } from "@/services/progress";

import { formatPercent } from "../format";
import Change from "./change";
import Sparkline from "./sparkline";

interface Improvement {
  trend: CategoryTrend;
  // Relative fall of the mistake rate against the previous period (0–1).
  drop: number;
}

function getMostImproved(categories: CategoryTrend[]): Improvement | null {
  let best: Improvement | null = null;
  for (const trend of categories) {
    if (trend.rate === null || trend.previousRate === null) continue;
    if (trend.rate >= trend.previousRate) continue;
    const drop = (trend.previousRate - trend.rate) / trend.previousRate;
    if (!best || drop > best.drop) best = { trend, drop };
  }
  return best;
}

export default async function CategoryTrends() {
  const trends = await getAccuracyTrendsService();
  if (!trends) return null;

  const { accuracy, categories } = trends;
  const hasAnswers = accuracy.weekly.some((rate) => rate !== null);
  const mostImproved = getMostImproved(categories);
  const weakest = categories.find((trend) => trend.rate !== null) ?? null;

  return (
    <Card aria-labelledby="grammar-title">
      <CardHeader className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <CardTitle
          id="grammar-title"
          className="font-display text-lg font-bold"
        >
          Grammar
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          Your first answers, last {TREND_WEEKS} weeks against the{" "}
          {TREND_WEEKS} before
        </span>
      </CardHeader>

      {!hasAnswers ? (
        <CardContent className="flex flex-col items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Languages className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Translate a few quiz sentences and you&apos;ll see which grammar
            areas trip you up, and how quickly they improve.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/programs">Take a quiz</Link>
          </Button>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Right on the first try
              </span>
              <div className="flex items-end justify-between gap-3">
                <span className="font-display text-3xl leading-none font-bold text-foreground tabular-nums">
                  {accuracy.rate === null ? "–" : formatPercent(accuracy.rate)}
                </span>
                <Sparkline values={accuracy.weekly} max={1} />
              </div>
              <Change
                rate={accuracy.rate}
                previousRate={accuracy.previousRate}
                isLowerBetter={false}
              />
            </div>

            <div className="flex flex-col gap-1 rounded-lg bg-muted/60 p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Most improved
              </span>
              {mostImproved ? (
                <>
                  <span className="font-display text-lg font-bold text-foreground">
                    {MISTAKE_CATEGORY_LABELS[mostImproved.trend.category]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatPercent(mostImproved.drop)} fewer mistakes than the {TREND_WEEKS} weeks before.
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Keep answering: improvements show up after a few weeks.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 rounded-lg bg-muted/60 p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Needs work
              </span>
              {weakest && weakest.rate !== null ? (
                <>
                  <span className="font-display text-lg font-bold text-foreground">
                    {MISTAKE_CATEGORY_LABELS[weakest.category]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    A mistake in {formatPercent(weakest.rate)} of your answers.
                  </span>
                  <Link
                    href="/practice"
                    className="mt-1 inline-flex items-center gap-1 self-start rounded-sm text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Practice it
                    <ArrowRight className="size-3.5" />
                  </Link>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No pattern yet: a few more answers will tell.
                </span>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <table className="w-full text-sm">
              <caption className="sr-only">
                Share of first answers with a mistake in each grammar area
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="pb-2 font-medium">
                    Area
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Answers with this mistake
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Change
                  </th>
                  <th scope="col" className="hidden pb-2 font-medium sm:table-cell">
                    Weekly
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((trend) => (
                  <tr
                    key={trend.category}
                    className="border-b border-border last:border-0"
                  >
                    <th
                      scope="row"
                      className="py-2.5 pr-3 text-left font-medium text-foreground"
                    >
                      {MISTAKE_CATEGORY_LABELS[trend.category]}
                    </th>
                    <td className="py-2.5 pr-3 text-muted-foreground tabular-nums">
                      {trend.rate === null
                        ? "Too few answers"
                        : formatPercent(trend.rate)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Change
                        rate={trend.rate}
                        previousRate={trend.previousRate}
                        isLowerBetter
                      />
                    </td>
                    <td className="hidden py-2.5 sm:table-cell">
                      <Sparkline values={trend.weekly} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function CategoryTrendsFallback() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
