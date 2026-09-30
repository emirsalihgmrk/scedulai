import { Suspense } from "react";

import ProgramsGrid, { ProgramsGridFallback } from "./programs-grid";
import ProgramsHeader from "./programs-header";

export default function PageView() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <ProgramsHeader />
      <Suspense fallback={<ProgramsGridFallback />}>
        <ProgramsGrid />
      </Suspense>
    </main>
  );
}
