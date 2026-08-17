import { Suspense } from "react";
import { VideoPanel, VideoPanelFallback } from "./_components/video-panel";
import { QuizPanel, QuizPanelFallback } from "./_components/quiz-panel";
import Header from "@/components/shared/header";
import { getVideo } from "@/services/video";
import { getOrCreateQuiz } from "@/services/quiz";

export default function Page() {
  const videoPromise = getVideo();
  const quizPromise = videoPromise.then((video) => getOrCreateQuiz(video.id));

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