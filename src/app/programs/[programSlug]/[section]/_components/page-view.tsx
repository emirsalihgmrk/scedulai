import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSectionByOrderService } from "@/services/program";
import { VideoPanel, VideoPanelFallback } from "./video-panel";
import { QuizPanel, QuizPanelFallback } from "./quiz-panel";

export default async function PageView({
  sectionOrder,
  programSlug,
}: {
  sectionOrder: number;
  programSlug: string;
}) {
  const currentSection = await getSectionByOrderService(
    programSlug,
    sectionOrder,
  );

  if (!currentSection) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_minmax(0,1fr)] xl:gap-8">
      <section aria-label="Video and transcript" className="min-w-0">
        <Suspense fallback={<VideoPanelFallback />}>
          <VideoPanel sectionId={currentSection.id} />
        </Suspense>
      </section>
      <section aria-label="AI interactive quiz" className="min-w-0">
        <Suspense fallback={<QuizPanelFallback />}>
          <QuizPanel sectionId={currentSection.id} />
        </Suspense>
      </section>
    </div>
  );
}

export function PageViewFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_minmax(0,1fr)] xl:gap-8">
      <section aria-label="Video and transcript" className="min-w-0">
        <VideoPanelFallback />
      </section>
      <section aria-label="AI interactive quiz" className="min-w-0">
        <QuizPanelFallback />
      </section>
    </div>
  );
}
