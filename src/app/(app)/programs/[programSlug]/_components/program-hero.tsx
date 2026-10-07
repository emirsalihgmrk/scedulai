import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  ListChecks,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import CefrBadge from "@/components/shared/cefr-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CEFR_LEVELS } from "@/constants/learning";
import { formatDuration } from "@/lib/utils";
import type { ProgramDetail } from "@/schemas/program";
import { getProgramService, getSectionsService } from "@/services/program";

import { getCurrentSectionId } from "./section-progress";

interface ProgramHeroProps {
  params: Promise<{ programSlug: string }>;
}

export default async function ProgramHero({ params }: ProgramHeroProps) {
  const { programSlug } = await params;
  const program = await getProgramService(programSlug);
  if (!program) notFound();
  const { title, description, thumbnailUrl } = program;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/programs"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        All programs
      </Link>

      <Card className="grid grid-cols-1 gap-6 p-(--card-spacing) [--card-spacing:--spacing(5)] md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 320px, 100vw"
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl leading-tight font-bold text-balance text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <Suspense fallback={<ProgramSectionsInfoFallback />}>
            <ProgramSectionsInfo program={program} />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}

interface ProgramSectionsInfoProps {
  program: ProgramDetail;
}

async function ProgramSectionsInfo({ program }: ProgramSectionsInfoProps) {
  const { slug, title, referenceUrl, channel } = program;
  const sections = await getSectionsService(slug);

  const totalSeconds = sections.reduce(
    (sum, section) => sum + (section.video?.durationSeconds ?? 0),
    0,
  );
  const completedCount = sections.filter(
    (section) => !!section.progress?.quizCompletedAt,
  ).length;
  const progressPercent =
    sections.length > 0
      ? Math.round((completedCount / sections.length) * 100)
      : 0;

  // Derived from the (request-cached) sections instead of stored, so it can
  // never drift from the video ratings. CEFR_LEVELS is ordered A1 → C2.
  const levelIndexes = sections.flatMap(({ video }) =>
    video?.cefrLevel ? [CEFR_LEVELS.indexOf(video.cefrLevel)] : [],
  );
  const levelRange =
    levelIndexes.length > 0
      ? {
          min: CEFR_LEVELS[Math.min(...levelIndexes)],
          max: CEFR_LEVELS[Math.max(...levelIndexes)],
        }
      : null;

  const currentId = getCurrentSectionId(sections);
  const resumeSection =
    sections.find((section) => section.id === currentId) ?? sections[0];
  const resumeLabel =
    completedCount > 0 ? "Continue where you left off" : "Start the program";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {levelRange && <CefrBadge min={levelRange.min} max={levelRange.max} />}
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-4" />
          {sections.length} sections
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" />
          {formatDuration(totalSeconds)} total
        </span>
        {channel && (
          <span className="inline-flex items-center gap-1.5">
            <Image
              src={channel.thumbnailUrl}
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-full bg-muted object-cover"
            />
            {channel.title}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">
            {completedCount}/{sections.length} completed
          </span>
        </div>
        <Progress value={progressPercent} />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {resumeSection && (
          <Button asChild>
            <Link href={`/programs/${slug}/section-${resumeSection.order}`}>
              <PlayCircle data-icon="inline-start" />
              {resumeLabel}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        )}
        {referenceUrl && (
          <Button asChild variant="ghost">
            <a
              href={referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open reference for ${title} in a new tab`}
            >
              Reference
              <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
        )}
      </div>
    </>
  );
}

export function ProgramHeroFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-5 w-32 animate-pulse rounded bg-muted" />

      <Card className="grid grid-cols-1 gap-6 p-(--card-spacing) [--card-spacing:--spacing(5)] md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>

          <ProgramSectionsInfoFallback />
        </div>
      </Card>
    </div>
  );
}

function ProgramSectionsInfoFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-5">
        <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-2 w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-1 flex gap-2">
        <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
