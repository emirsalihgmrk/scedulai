import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "@/components/shared/header";
import {
  SUPPORTED_NATIVE_LANGUAGES,
  SUPPORTED_TARGET_LANGUAGES,
} from "@/constants/language";
import { getCurrentUser } from "@/services/auth";
import { getSectionByOrderService } from "@/services/program";
import { getVideoService } from "@/services/video";
import { getOrCreateQuizService } from "@/services/quiz";
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

  const [currentSection, user] = await Promise.all([
    getSectionByOrderService(programSlug, order),
    getCurrentUser(),
  ]);

  if (!currentSection) notFound();

  const nativeLang = SUPPORTED_NATIVE_LANGUAGES.find(
    (l) => l.code === user?.nativeLanguage,
  );
  const targetLang = SUPPORTED_TARGET_LANGUAGES.find(
    (l) => l.code === user?.targetLanguage,
  );
  const nativeLangLabel = nativeLang?.nativeName ?? "Native";
  const targetLangLabel = targetLang?.nativeName ?? "English";

  const videoPromise = getVideoService(currentSection.id);
  const quizPromise = getOrCreateQuizService(currentSection.id);

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
              <QuizPanel
                quizPromise={quizPromise}
                nativeLangLabel={nativeLangLabel}
                targetLangLabel={targetLangLabel}
              />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}