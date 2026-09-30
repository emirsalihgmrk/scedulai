import { ArrowRight, ExternalLink, LibraryBig } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import DifficultyBadge from "@/components/shared/difficulty-badge";
import EmptyState from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ProgramListItem } from "@/schemas/program";
import { getProgramsService } from "@/services/program";

export default async function ProgramsGrid() {
  const programs = await getProgramsService();

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={LibraryBig}
        title="No programs yet"
        description="There are no programs to list right now. Programs will appear here once you seed the database."
      />
    );
  }

  return (
    <section aria-label="Available programs" className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{programs.length}</span>{" "}
        programs available
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </section>
  );
}

interface ProgramCardProps {
  program: ProgramListItem;
}

function ProgramCard({ program }: ProgramCardProps) {
  const {
    slug,
    title,
    shortDescription,
    thumbnailUrl,
    difficulty,
    referenceUrl,
  } = program;

  return (
    <Card className="group/program transition-shadow hover:ring-foreground/20">
      {/* Thumbnail — first child so Card rounds the top corners */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 384px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover/program:scale-105"
        />
        {difficulty && (
          <DifficultyBadge
            difficulty={difficulty}
            className="absolute top-3 left-3"
          />
        )}
      </div>

      <CardContent className="flex flex-col gap-2">
        <h3 className="font-display text-lg leading-snug font-semibold text-balance text-foreground">
          {title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {shortDescription}
        </p>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <Button asChild size="sm">
          <Link href={`/programs/${slug}`}>
            Review
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>

        {referenceUrl && (
          <Button asChild variant="ghost" size="sm">
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
      </CardFooter>
    </Card>
  );
}

export function ProgramsGridFallback() {
  return (
    <section
      aria-label="Loading programs"
      aria-busy
      className="flex flex-col gap-5"
    >
      <div className="h-4 w-36 animate-pulse rounded-md bg-muted" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProgramCardFallback key={i} />
        ))}
      </div>
    </section>
  );
}

function ProgramCardFallback() {
  return (
    <Card>
      <div className="aspect-video w-full animate-pulse bg-muted" />

      <CardContent className="flex flex-col gap-3">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded-md bg-muted" />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
      </CardFooter>
    </Card>
  );
}
