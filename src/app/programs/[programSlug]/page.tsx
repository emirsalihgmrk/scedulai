import { Suspense } from "react";

import Header from "@/components/shared/header";
import { getCurrentUser } from "@/services/auth";
import { getProgramService, getSectionsService } from "@/services/program";
import { ProgramHero, ProgramHeroFallback } from "./_components/program-hero";
import {
  SectionTimeline,
  SectionTimelineFallback,
} from "./_components/section-timeline";

export default async function Page({
  params,
}: {
  params: Promise<{ programSlug: string }>;
}) {
  const { programSlug } = await params;

  const user = await getCurrentUser();
  const programPromise = getProgramService(programSlug);
  const sectionsPromise = getSectionsService(programSlug, user?.id ?? null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<ProgramHeroFallback />}>
          <ProgramHero
            programPromise={programPromise}
            sectionsPromise={sectionsPromise}
          />
        </Suspense>
        <Suspense fallback={<SectionTimelineFallback />}>
          <SectionTimeline
            programSlug={programSlug}
            sectionsPromise={sectionsPromise}
          />
        </Suspense>
      </main>
    </div>
  );
}