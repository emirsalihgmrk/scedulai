import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import QuizCard, { QuizCardFallback } from "@/components/shared/quiz-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MISTAKE_CATEGORY_LABELS } from "@/constants/mistake";
import { getCurrentUserService } from "@/services/auth";
import { getMistakeService } from "@/services/mistake";
import { getPracticeService } from "@/services/practice";

import MistakeSummary from "../_components/mistake-summary";

interface ContentProps {
  params: Promise<{ mistakeId: string }>;
}

export default async function Content({ params }: ContentProps) {
  const { mistakeId } = await params;
  // Postgres rejects a malformed uuid, which would surface as a server error.
  if (!z.uuid().safeParse(mistakeId).success) notFound();

  const practicePromise = getPracticeService(mistakeId);
  const [user, mistake] = await Promise.all([
    getCurrentUserService(),
    getMistakeService(mistakeId),
  ]);
  if (!mistake) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:gap-8">
      <section aria-label="Your mistake" className="flex min-w-0 flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/practice">
            <ChevronLeft data-icon="inline-start" />
            All mistakes
          </Link>
        </Button>

        <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-xl font-bold text-foreground">
              Your mistake
            </h1>
            <Badge variant="secondary">
              {MISTAKE_CATEGORY_LABELS[mistake.category]}
            </Badge>
          </div>
          <MistakeSummary mistake={mistake} />
        </div>

        <p className="text-sm text-muted-foreground">
          Translate the new sentences. Each one needs the structure you got
          wrong; a miss comes back at the end until you get it right.
        </p>
      </section>

      <section aria-label="Mistake practice" className="min-w-0">
        <Suspense fallback={<QuizCardFallback />}>
          <QuizCard
            user={user}
            source={{ kind: "practice", mistakeId: mistake.id }}
            quizPromise={practicePromise}
          />
        </Suspense>
      </section>
    </div>
  );
}

export function ContentFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:gap-8">
      <section aria-label="Your mistake" className="flex min-w-0 flex-col gap-4">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="h-6 w-36 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
        </div>
      </section>
      <section aria-label="Mistake practice" className="min-w-0">
        <QuizCardFallback />
      </section>
    </div>
  );
}
