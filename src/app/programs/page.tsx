import { Suspense } from "react";

import Header from "@/components/shared/header";
import { ProgramsHeader } from "./_components/programs-header";
import {
  ProgramsGrid,
  ProgramsGridFallback,
} from "./_components/programs-grid";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <ProgramsHeader />
        <Suspense fallback={<ProgramsGridFallback />}>
          <ProgramsGrid />
        </Suspense>
      </main>
    </div>
  );
}
