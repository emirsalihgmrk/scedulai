"use client";

import { useState } from "react";
import {
  Play,
  Volume2,
  Maximize,
  Rewind,
  FastForward,
  Captions,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Video } from "@/types/video";

function ControlButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className="text-white/90 hover:bg-white/15 hover:text-white"
    >
      {children}
    </Button>
  );
}

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
              alt={`${video.channelTitle} presenting "${video.title}"`}
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
              className="absolute inset-0 flex items-center justify-center"
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

            {/* Custom control bar */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              {/* Scrubber */}
              <div className="mb-3 flex items-center gap-3 text-[11px] font-medium tabular-nums text-white">
                <span>04:12</span>
                <div className="relative h-1.5 flex-1 rounded-full bg-white/25">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    style={{ width: `30%` }}
                  />
                  <div
                    className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow"
                    style={{ left: `calc(30% - 7px)` }}
                  />
                </div>
                <span className="text-white/70">
                  {formatDuration(video.durationSeconds)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <ControlButton label="Rewind 10 seconds">
                    <Rewind />
                  </ControlButton>
                  <ControlButton label="Play" onClick={() => setPlaying(true)}>
                    <Play />
                  </ControlButton>
                  <ControlButton label="Forward 10 seconds">
                    <FastForward />
                  </ControlButton>
                  <ControlButton label="Volume">
                    <Volume2 />
                  </ControlButton>
                </div>
                <div className="flex items-center gap-0.5">
                  <ControlButton label="Captions">
                    <Captions />
                  </ControlButton>
                  <ControlButton label="Settings">
                    <Settings />
                  </ControlButton>
                  <ControlButton label="Fullscreen">
                    <Maximize />
                  </ControlButton>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </figure>
  );
}
