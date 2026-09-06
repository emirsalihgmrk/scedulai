import { FileQuestion, LogIn, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { getUserLanguageLabels } from "@/constants/language";
import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/services/auth";
import { generateQuizByAi, getQuizService } from "@/services/quiz";
import { QuizCard } from "./quiz-card";

export async function QuizPanel({ sectionId }: { sectionId: string }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="sticky top-20">
        <EmptyState
          icon={LogIn}
          title="Sign in for the quiz"
          description="You need to sign in to your account to take this section's quiz."
          className="h-[80vh]"
        />
      </div>
    );
  }

  let quiz = await getQuizService(sectionId);

  if (!quiz) {
    try {
      quiz = await generateQuizByAi(sectionId);
    } catch (error) {
      if (error instanceof AppError) {
        return (
          <div className="sticky top-20">
            <EmptyState
              icon={FileQuestion}
              title="Quiz could not be prepared"
              description={error.message}
              className="h-[80vh]"
            />
          </div>
        );
      }
      throw error;
    }
  }

  const { nativeLangLabel, targetLangLabel } = getUserLanguageLabels(user);

  return (
    <QuizCard
      quiz={quiz}
      nativeLangLabel={nativeLangLabel}
      targetLangLabel={targetLangLabel}
    />
  );
}

export function QuizPanelFallback() {
  return (
    <div className="sticky top-20">
      <div className="flex h-[80vh] flex-col items-center justify-center gap-5 rounded-xl border border-border p-6 text-center">
        {/* Pulsing AI badge */}
        <span className="relative flex size-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-7 animate-pulse" />
          </span>
        </span>

        <div className="flex flex-col gap-1.5">
          <p className="bg-linear-to-r from-primary to-chart-5 bg-clip-text font-display text-lg font-semibold text-transparent">
            Quiz is being prepared with AI
          </p>
          <p className="text-sm text-muted-foreground">
            Personalized translation sentences are being generated from your
            transcript...
          </p>
        </div>

        {/* Bouncing dots */}
        <span className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
