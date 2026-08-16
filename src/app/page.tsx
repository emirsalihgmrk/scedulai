import { Suspense } from "react";
import { VideoPanel, VideoPanelFallback } from "./_components/video-panel";
import { QuizPanel } from "./_components/quiz-panel";
import Header from "@/components/shared/header";

export default async function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr] xl:gap-8">
          <section aria-label="Video and transcript">
            <Suspense fallback={<VideoPanelFallback />}>
              <VideoPanel />
            </Suspense>
          </section>
          <section aria-label="AI interactive quiz">
            <QuizPanel />
          </section>
        </div>
      </main>
    </div>
  );
}
