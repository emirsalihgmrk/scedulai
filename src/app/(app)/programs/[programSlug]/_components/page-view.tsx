import { Suspense } from "react";

import ProgramHero, { ProgramHeroFallback } from "./program-hero";
import SectionTimeline, { SectionTimelineFallback } from "./section-timeline";

interface PageViewProps {
  params: Promise<{ programSlug: string }>;
}

export default function PageView({ params }: PageViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <Suspense fallback={<ProgramHeroFallback />}>
        <ProgramHero params={params} />
      </Suspense>
      <Suspense fallback={<SectionTimelineFallback />}>
        <SectionTimeline params={params} />
      </Suspense>
    </main>
  );
}
