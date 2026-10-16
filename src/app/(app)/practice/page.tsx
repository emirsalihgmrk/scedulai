import { Suspense } from "react";

import MistakeList, { MistakeListFallback } from "./_components/mistake-list";
import ReviewSummary, {
  ReviewSummaryFallback,
} from "./_components/review-summary";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Practice</h1>
        <p className="text-sm text-muted-foreground">
          Review your saved words when they&apos;re due, and fix every grammar
          mistake from your quizzes with new sentences.
        </p>
      </div>
      <Suspense fallback={<ReviewSummaryFallback />}>
        <ReviewSummary />
      </Suspense>
      <Suspense fallback={<MistakeListFallback />}>
        <MistakeList />
      </Suspense>
    </main>
  );
}
