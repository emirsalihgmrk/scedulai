"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/schemas/video";

export function VideoPlayer({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {/* 16:9 video surface */}
      <div className="group relative aspect-video w-full overflow-hidden bg-primary/10">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            <Image
              src={video.thumbnailUrl}
              alt={`${video.channel.title} presenting "${video.title}"`}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-black/20" />

            {/* Center play button */}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white/20 transition-transform duration-200 group-hover:scale-105">
                <Play className="size-7 translate-x-0.5" />
              </span>
            </button>

            {/* Live caption chip */}
            <Badge className="absolute left-4 top-4 gap-1.5 bg-black/45 text-white backdrop-blur-sm">
              <span className="size-2 animate-pulse rounded-full bg-warning" />
              Auto captions on
            </Badge>
          </>
        )}
      </div>
    </figure>
  );
}
