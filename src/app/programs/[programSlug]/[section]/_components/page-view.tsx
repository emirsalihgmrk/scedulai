import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSectionByOrderService } from "@/services/program";
import { VideoSection, VideoSectionFallback } from "./video-section";
import { TranscriptCard, TranscriptCardFallback } from "./transcript-card";
import { QuizCard } from "./quiz-card";
import { getQuizService } from "@/services/quiz";
import { getTranscriptService, getVideoService } from "@/services/video";
import QuizCardFallback from "./quiz-card/fallback";
import { getCurrentUser } from "@/services/auth";
import { PlayerProvider } from "./player-context";

function parseOrder(section: string): number | null {
  const match = /^section-(\d+)$/.exec(section);
  if (!match) return null;
  return Number(match[1]);
}

export default async function PageView({
  params,
}: {
  params: Promise<{ programSlug: string; section: string }>;
}) {
  const user = await getCurrentUser();
  const { programSlug, section } = await params;

  const sectionOrder = parseOrder(section);
  if (sectionOrder === null) notFound();

  const currentSection = await getSectionByOrderService(
    programSlug,
    sectionOrder,
  );

  if (!currentSection) notFound();

  const quizPromise = getQuizService(currentSection.id);
  const transcriptPromise = getVideoService(currentSection.id).then((video) =>
    video ? getTranscriptService(video.id) : [],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_minmax(0,1fr)] xl:gap-8">
      <PlayerProvider>
        <section
          aria-label="Video and transcript"
          className="flex min-w-0 flex-col gap-5"
        >
          <Suspense fallback={<VideoSectionFallback />}>
            <VideoSection sectionId={currentSection.id} />
          </Suspense>
          <Suspense fallback={<TranscriptCardFallback />}>
            <TranscriptCard transcriptPromise={transcriptPromise} />
          </Suspense>
        </section>
      </PlayerProvider>
      <section aria-label="AI interactive quiz" className="min-w-0">
        <Suspense fallback={<QuizCardFallback />}>
          <QuizCard
            user={user}
            sectionId={currentSection.id}
            quizPromise={quizPromise}
          />
        </Suspense>
      </section>
    </div>
  );
}

export function PageViewFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_minmax(0,1fr)] xl:gap-8">
      <section
        aria-label="Video and transcript"
        className="flex min-w-0 flex-col gap-5"
      >
        <VideoSectionFallback />
        <TranscriptCardFallback />
      </section>
      <section aria-label="AI interactive quiz" className="min-w-0">
        <QuizCardFallback />
      </section>
    </div>
  );
}
