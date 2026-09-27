import { Suspense } from "react";

import { ProgramsHeader } from "./_components/programs-header";
import {
  ProgramsGrid,
  ProgramsGridFallback,
} from "./_components/programs-grid";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <ProgramsHeader />
      <Suspense fallback={<ProgramsGridFallback />}>
        <ProgramsGrid />
      </Suspense>
    </main>
  );
}
