import { Suspense } from "react";
import { Calendar, VideoOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "./video-player";
import { TranscriptCard, TranscriptCardFallback } from "./transcript-card";
import { EmptyState } from "./empty-state";
import { getTranscriptService } from "@/services/video";
import { Video } from "@/types/video";
import { formatDate } from "@/lib/utils";

export async function VideoPanel({
  videoPromise,
}: {
  videoPromise: Promise<Video | null>;
}) {
  const video = await videoPromise;

  if (!video) {
    return (
      <EmptyState
        icon={VideoOff}
        title="Bu section için video yok"
        description="Bu section'a henüz bir video eklenmemiş."
        className="min-h-[60vh]"
      />
    );
  }

  const transcriptPromise = getTranscriptService(video.id);

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <VideoPlayer video={video} />

      {/* Metadata */}
      <div>
        <h1 className="text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
          {video.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar>
              <AvatarImage
                src={video.channelThumbnailUrl}
                alt={video.channelTitle}
              />
              <AvatarFallback>
                {video.channelTitle.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                {video.channelTitle}
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" />
            {formatDate(video.publishedAt)}
          </div>
        </div>
      </div>

      <Suspense fallback={<TranscriptCardFallback />}>
        <TranscriptCard transcriptPromise={transcriptPromise} />
      </Suspense>
    </div>
  );
}

export function VideoPanelFallback() {
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

      <TranscriptCardFallback />
    </div>
  );
}
