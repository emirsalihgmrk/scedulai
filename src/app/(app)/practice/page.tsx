import { Suspense } from "react";

import MistakeNotebook, {
  MistakeNotebookFallback,
} from "./_components/mistake-notebook";
import SessionSummary, {
  SessionSummaryFallback,
} from "./_components/session-summary";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Practice</h1>
        <p className="text-sm text-muted-foreground">
          One session a day: your saved words when they&apos;re due, then new
          sentences for the grammar you get wrong most.
        </p>
      </div>
      <Suspense fallback={<SessionSummaryFallback />}>
        <SessionSummary />
      </Suspense>
      <Suspense fallback={<MistakeNotebookFallback />}>
        <MistakeNotebook />
      </Suspense>
    </main>
  );
}
