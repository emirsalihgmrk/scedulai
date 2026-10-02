import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUserService } from "@/services/auth";
import { getSectionByOrderService } from "@/services/program";
import { getQuizService } from "@/services/quiz";
import { getTranscriptService, getVideoService } from "@/services/video";

import { PlayerProvider } from "./_components/player-context";
import QuizCard, { QuizCardFallback } from "./_components/quiz-card";
import TranscriptCard, { TranscriptCardFallback } from "./_components/transcript-card";
import VideoSection, { VideoSectionFallback } from "./_components/video-section";

// Section slugs look like "section-3"; the number is the section's order.
function parseSectionOrder(sectionSlug: string): number | null {
  const match = /^section-(\d+)$/.exec(sectionSlug);
  return match ? Number(match[1]) : null;
}

interface ContentProps {
  params: Promise<{ programSlug: string; sectionSlug: string }>;
}

// Every panel needs the section id, so this resolves it once (the page-wide
// blocking lookup) and streams the panels in their own Suspense boundaries.
export default async function Content({
  params,
}: ContentProps) {
  const { programSlug, sectionSlug } = await params;
  const order = parseSectionOrder(sectionSlug);
  if (order === null) notFound();

  const [user, section] = await Promise.all([
    getCurrentUserService(),
    getSectionByOrderService(programSlug, order),
  ]);
  if (!section) notFound();

  const quizPromise = getQuizService(section.id);
  const transcriptPromise = getVideoService(section.id).then((video) =>
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
            <VideoSection sectionId={section.id} />
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
            sectionId={section.id}
            quizPromise={quizPromise}
          />
        </Suspense>
      </section>
    </div>
  );
}

export function ContentFallback() {
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
