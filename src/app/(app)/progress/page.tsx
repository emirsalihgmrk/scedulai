import { Suspense } from "react";

import SessionSummary, {
  SessionSummaryFallback,
} from "@/components/shared/session-summary";

import ActivityCalendar, {
  ActivityCalendarFallback,
} from "./_components/activity-calendar";
import CategoryTrends, {
  CategoryTrendsFallback,
} from "./_components/category-trends";
import LevelEstimate, {
  LevelEstimateFallback,
} from "./_components/level-estimate";
import ListeningChart, {
  ListeningChartFallback,
} from "./_components/listening-chart";
import ProgressHero, { ProgressHeroFallback } from "./_components/progress-hero";
import StatTiles, { StatTilesFallback } from "./_components/stat-tiles";
import VocabularyProgress, {
  VocabularyProgressFallback,
} from "./_components/vocabulary-progress";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Progress</h1>
        <p className="text-sm text-muted-foreground">
          What you&apos;ve listened to, learned and fixed, and what to do next.
        </p>
      </div>

      <Suspense fallback={<ProgressHeroFallback />}>
        <ProgressHero />
      </Suspense>
      <Suspense fallback={<SessionSummaryFallback />}>
        <SessionSummary />
      </Suspense>
      <Suspense fallback={<StatTilesFallback />}>
        <StatTiles />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityCalendarFallback />}>
            <ActivityCalendar />
          </Suspense>
        </div>
        <Suspense fallback={<LevelEstimateFallback />}>
          <LevelEstimate />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<ListeningChartFallback />}>
          <ListeningChart />
        </Suspense>
        <Suspense fallback={<VocabularyProgressFallback />}>
          <VocabularyProgress />
        </Suspense>
      </div>

      <Suspense fallback={<CategoryTrendsFallback />}>
        <CategoryTrends />
      </Suspense>
    </main>
  );
}
