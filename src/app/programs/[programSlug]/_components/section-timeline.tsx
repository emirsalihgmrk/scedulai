import Link from "next/link";
import { ArrowRight, Check, CirclePlay, Clock, Play } from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";
import type { SectionListItem } from "@/schemas/program";
import { currentSectionId, isSectionCompleted } from "./section-progress";
import { getCurrentUser } from "@/services/auth";
import { getSectionsService } from "@/services/program";

export async function SectionTimeline({
  programSlug,
}: {
  programSlug: string;
}) {
  const user = await getCurrentUser();
  const sections = await getSectionsService(programSlug, user?.id ?? null);
  const currentId = currentSectionId(sections);

  return (
    <section aria-label="Program sections" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">
          Sections
        </h2>
        <span className="text-sm text-muted-foreground">
          {sections.length} sections
        </span>
      </div>

      <ol className="flex flex-col">
        {sections.map((section, index) => (
          <SectionRow
            key={section.id}
            section={section}
            programSlug={programSlug}
            isCompleted={isSectionCompleted(section)}
            isCurrent={section.id === currentId}
            isLast={index === sections.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}

function SectionRow({
  section,
  programSlug,
  isCompleted,
  isCurrent,
  isLast,
}: {
  section: SectionListItem;
  programSlug: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const nodeClass = isCompleted
    ? "bg-success text-success-foreground ring-success/30"
    : isCurrent
      ? "bg-primary text-primary-foreground ring-primary/30"
      : "bg-secondary text-secondary-foreground ring-border";

  const statusLabel = isCompleted
    ? "Completed"
    : isCurrent
      ? "Recently viewed"
      : null;

  // Video watch progress (user position / total duration).
  const durationSeconds = section.video?.durationSeconds ?? 0;
  const positionSeconds = section.progress?.videoPositionSeconds ?? 0;
  const watchPercent =
    durationSeconds > 0
      ? Math.min(100, Math.round((positionSeconds / durationSeconds) * 100))
      : 0;

  return (
    <li className="relative flex gap-4 pb-4 last:pb-0">
      {/* Vertical connector */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute top-11 bottom-0 left-5 w-px -translate-x-1/2 bg-border"
        />
      )}

      {/* Order node */}
      <div
        className={cn(
          "hidden sm:flex z-10 size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4",
          nodeClass,
        )}
      >
        {isCompleted ? <Check className="size-5" /> : section.order}
      </div>

      {/* Content */}
      <Link
        href={`/programs/${programSlug}/section-${section.order}`}
        className="group/section relative flex flex-1 items-center overflow-hidden rounded-xl bg-card p-3 ring-2 ring-foreground/10 transition-all hover:ring-foreground/25 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Thumbnail */}
          {section.video && (
            <div className="relative hidden aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.video.thumbnailUrl}
                alt=""
                className="size-full object-cover transition-transform duration-300 group-hover/section:scale-105"
              />
            </div>
          )}

          {/* Text */}
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span>Section {section.order}</span>
              {statusLabel && (
                <>
                  <span className="" aria-hidden>
                    ·
                  </span>
                  <span>{statusLabel}</span>
                </>
              )}
            </div>
            <h3 className="truncate font-display text-base leading-snug font-semibold text-foreground">
              {section.title}
            </h3>
            {section.video && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {formatDuration(section.video.durationSeconds)}
                <span aria-hidden>·</span>
                <CirclePlay className="size-3.5" />
                <span className="truncate">{section.video.title}</span>
              </span>
            )}
          </div>

          {/* Action affordance */}
          <div className="ml-auto shrink-0 self-center text-muted-foreground">
            {isCurrent ? (
              <ArrowRight className="size-5 text-primary" />
            ) : (
              <>
                <Play className="size-5 group-hover/section:hidden" />
                <ArrowRight className="hidden size-5 text-primary group-hover/section:block" />
              </>
            )}
          </div>
        </div>

        {/* YouTube-style watch bar — pinned to the bottom, adds no row height */}
        {section.video && watchPercent > 0 && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[2.5px] bg-foreground/10"
          >
            <span
              className="block h-full bg-highlight"
              style={{ width: `${watchPercent}%` }}
            />
          </span>
        )}
      </Link>
    </li>
  );
}

export function SectionTimelineFallback() {
  return (
    <section aria-label="Program sections" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>

      <ol className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="flex gap-4">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted ring-4 ring-border" />
            <div className="flex flex-1 items-center gap-4 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
              <div className="hidden aspect-video w-28 shrink-0 animate-pulse rounded-md bg-muted sm:block" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
