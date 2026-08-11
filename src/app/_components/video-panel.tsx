import { Calendar } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { video } from "@/lib/data";
import { VideoPlayer } from "@/app/_components/video-player";
import { TranscriptCard } from "@/app/_components/transcript-card";

export function VideoPanel() {
  return (
    <div className="flex min-h-0 flex-col gap-5">
      <VideoPlayer />

      {/* Metadata */}
      <div>
        <h1 className="text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
          {video.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar>
              <AvatarImage src="/speaker-avatar.png" alt="" />
              <AvatarFallback>EV</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                {video.speaker}
              </p>
              <p className="text-xs text-muted-foreground">
                {video.speakerRole}
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" />
            {video.releaseDate}
          </div>
        </div>
      </div>

      <TranscriptCard />
    </div>
  );
}
