import { VideoOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "./video-player";
import { EmptyState } from "@/components/shared/empty-state";
import { getVideoService } from "@/services/video";
import { getSectionProgressService } from "@/services/program";
import VideoMetadata from "./video-metadata";

export async function VideoSection({ sectionId }: { sectionId: string }) {
  const [video, progress] = await Promise.all([
    getVideoService(sectionId),
    getSectionProgressService(sectionId),
  ]);

  if (!video) {
    return (
      <EmptyState
        icon={VideoOff}
        title="No video for this section"
        description="No video has been added to this section yet."
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <VideoPlayer
        video={video}
        sectionId={sectionId}
        initialPositionSeconds={progress?.videoPositionSeconds ?? 0}
      />
      <VideoMetadata video={video} />
    </div>
  );
}

export function VideoSectionFallback() {
  return (
    <div className="flex min-h-0 flex-col gap-5">
      {/* Video surface */}
      <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />

      {/* Metadata */}
      <div>
        <div className="h-7 w-3/4 animate-pulse rounded bg-muted sm:h-8" />
        <div className="mt-3 flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
