import { ArrowRight, Compass, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SectionProgressWithSection } from "@/schemas/program";

interface ContinueWatchingProps {
  latest: SectionProgressWithSection | null;
}

export default function ContinueWatching({ latest }: ContinueWatchingProps) {
  if (!latest) {
    return (
      <div className="flex h-full flex-col justify-center gap-3 rounded-lg bg-muted/60 p-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Compass className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">Pick your first video</p>
          <p className="text-sm text-muted-foreground">
            Everything you watch, translate and save shows up here.
          </p>
        </div>
        <Button asChild size="sm" className="self-start">
          <Link href="/programs">
            Browse programs
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    );
  }

  const { section, videoPositionSeconds, quizCompletedAt } = latest;
  const duration = section.video?.durationSeconds ?? 0;
  const watched =
    duration > 0 ? Math.min(100, (videoPositionSeconds / duration) * 100) : 0;

  return (
    <Link
      href={`/programs/${section.program.slug}/section-${section.order}`}
      className="group flex flex-col gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        {section.video && (
          <Image
            src={section.video.thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 340px, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-foreground/20">
          <PlayCircle className="size-12 text-white opacity-90 drop-shadow" />
        </span>
        <Progress
          value={watched}
          aria-label="Watched"
          className="absolute inset-x-0 bottom-0 h-1 rounded-none bg-foreground/30"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">
          {quizCompletedAt ? "Watch again" : "Continue where you left off"}
        </span>
        <span className="line-clamp-1 font-medium text-foreground">
          {section.title}
        </span>
        <span className="line-clamp-1 text-sm text-muted-foreground">
          {section.program.title}
        </span>
      </div>
    </Link>
  );
}
