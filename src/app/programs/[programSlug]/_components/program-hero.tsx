import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProgramService, getSectionsService } from "@/services/program";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  ListChecks,
  PlayCircle,
} from "lucide-react";

import { DIFFICULTY_BADGE_CLASSES } from "@/constants/difficulty";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProgramDetail } from "@/schemas/program";
import { currentSectionId, isSectionCompleted } from "./section-progress";
import { getCurrentUser } from "@/services/auth";

export async function ProgramHero({ programSlug }: { programSlug: string }) {
  const program = await getProgramService(programSlug);
  if (!program) notFound();
  const {
    title,
    description,
    thumbnailUrl,
    difficulty,
    referenceUrl,
    channel,
  } = program;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/programs"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        Tüm programlar
      </Link>

      <Card className="grid grid-cols-1 gap-6 p-(--card-spacing) [--card-spacing:--spacing(5)] md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="" className="size-full object-cover" />
          {difficulty && (
            <Badge
              className={`absolute top-3 left-3 ${DIFFICULTY_BADGE_CLASSES[difficulty]}`}
            >
              {difficulty}
            </Badge>
          )}
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
            <ProgramSectionsInfo
              programSlug={programSlug}
              channel={channel}
              referenceUrl={referenceUrl}
              title={title}
            />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}

async function ProgramSectionsInfo({
  programSlug,
  channel,
  referenceUrl,
  title,
}: {
  programSlug: string;
  channel: ProgramDetail["channel"];
  referenceUrl: string | null;
  title: string;
}) {
  const user = await getCurrentUser();
  const sections = await getSectionsService(programSlug, user?.id ?? null);

  const totalSeconds = sections.reduce(
    (sum, section) => sum + (section.video?.durationSeconds ?? 0),
    0,
  );
  const completedCount = sections.filter(isSectionCompleted).length;
  const progressPercent =
    sections.length > 0
      ? Math.round((completedCount / sections.length) * 100)
      : 0;

  const currentId = currentSectionId(sections);
  const resumeSection =
    sections.find((section) => section.id === currentId) ?? sections[0];
  const resumeLabel =
    completedCount > 0 ? "Kaldığın yerden devam et" : "Programa başla";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-4" />
          {sections.length} bölüm
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" />
          {formatDuration(totalSeconds)} toplam
        </span>
        {channel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center overflow-hidden rounded-full bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={channel.thumbnailUrl}
                alt=""
                className="size-full object-cover"
              />
            </span>
            {channel.title}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">İlerleme</span>
          <span className="text-foreground">
            {completedCount}/{sections.length} tamamlandı
          </span>
        </div>
        <Progress value={progressPercent} />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {resumeSection && (
          <Button asChild>
            <Link
              href={`/programs/${programSlug}/section-${resumeSection.order}`}
            >
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
              aria-label={`${title} referansını yeni sekmede aç`}
            >
              Referans
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
