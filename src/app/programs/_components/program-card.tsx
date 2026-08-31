import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { DIFFICULTY_BADGE_CLASSES } from "@/constants/difficulty";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ProgramListItem } from "@/schemas/program";

export function ProgramCard({ program }: { program: ProgramListItem }) {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="size-full object-cover transition-transform duration-300 group-hover/program:scale-105"
        />
        {difficulty && (
          <Badge
            className={`absolute top-3 left-3 ${DIFFICULTY_BADGE_CLASSES[difficulty]}`}
          >
            {difficulty}
          </Badge>
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
