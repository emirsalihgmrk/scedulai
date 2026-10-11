import { Suspense } from "react";

import VocabularyList, {
  VocabularyListFallback,
} from "./_components/vocabulary-list";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Vocabulary</h1>
        <p className="text-sm text-muted-foreground">
          Words and phrases you saved from transcripts and quizzes, with the
          sentence you found them in.
        </p>
      </div>
      <Suspense fallback={<VocabularyListFallback />}>
        <VocabularyList />
      </Suspense>
    </main>
  );
}
