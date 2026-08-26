import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "@/components/shared/header";
import { getSectionByOrderService } from "@/services/program";
import { getVideoBySectionIdService } from "@/services/video";
import { findOrCreateQuiz } from "@/services/quiz";
import { VideoPanel, VideoPanelFallback } from "./_components/video-panel";
import { QuizPanel, QuizPanelFallback } from "./_components/quiz-panel";

function parseOrder(section: string): number | null {
  const match = /^section-(\d+)$/.exec(section);
  if (!match) return null;
  return Number(match[1]);
}

export default async function Page({
  params,
}: {
  params: Promise<{ programSlug: string; section: string }>;
}) {
  const { programSlug, section } = await params;

  const order = parseOrder(section);
  if (order === null) notFound();

  const currentSection = await getSectionByOrderService(programSlug, order);
  if (!currentSection) notFound();

  const videoPromise = getVideoBySectionIdService(currentSection.id);
  const quizPromise = findOrCreateQuiz(currentSection.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_minmax(0,1fr)] xl:gap-8">
          <section aria-label="Video and transcript" className="min-w-0">
            <Suspense fallback={<VideoPanelFallback />}>
              <VideoPanel videoPromise={videoPromise} />
            </Suspense>
          </section>
          <section aria-label="AI interactive quiz" className="min-w-0">
            <Suspense fallback={<QuizPanelFallback />}>
              <QuizPanel quizPromise={quizPromise} />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
