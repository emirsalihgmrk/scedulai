import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Video } from "@/schemas/video";
import { Calendar } from "lucide-react";

export default function VideoMetadata({ video }: { video: Video }) {
  return (
    <div>
      <h1 className="text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
        {video.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar>
            <AvatarImage
              src={video.channel.thumbnailUrl}
              alt={video.channel.title}
            />
            <AvatarFallback>
              {video.channel.title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">
              {video.channel.title}
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
  );
}
