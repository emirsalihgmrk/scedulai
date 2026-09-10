"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Video } from "@/schemas/video";
import { cn } from "@/lib/utils";
import { useYouTubePlayer } from "./use-youtube-player";
import { PlayerControls } from "./player-controls";

interface VideoPlayerProps {
  video: Video;
  sectionId: string;
  initialPositionSeconds: number;
}

export function VideoPlayer({
  video,
  sectionId,
  initialPositionSeconds,
}: VideoPlayerProps) {
  // With saved progress we mount straight away (resume frame); a fresh video
  // stays on the thumbnail until the user presses play.
  const [started, setStarted] = useState(initialPositionSeconds > 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const {
    containerRef,
    isReady,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    skip,
  } = useYouTubePlayer({
    videoId: video.youtubeId,
    sectionId,
    startSeconds: initialPositionSeconds,
    enabled: started,
  });

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === surfaceRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void surfaceRef.current?.requestFullscreen();
    }
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {/* 16:9 video surface */}
      <div
        ref={surfaceRef}
        className={cn(
          "group relative w-full overflow-hidden bg-primary/10",
          isFullscreen ? "h-full bg-black" : "aspect-video",
        )}
      >
        {/* Poster shown before the player exists / until it's ready */}
        {!isReady && (
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
        )}

        {started ? (
          <>
            {/* YT replaces the inner div with the player iframe */}
            <div
              ref={containerRef}
              className="absolute inset-0 h-full w-full [&>iframe]:size-full"
            />
            {isReady && (
              <div className="absolute inset-x-0 bottom-0 z-10">
                <PlayerControls
                  isPlaying={isPlaying}
                  isFullscreen={isFullscreen}
                  currentTime={currentTime}
                  duration={duration}
                  onTogglePlay={togglePlay}
                  onSkip={skip}
                  onSeek={seekTo}
                  onToggleFullscreen={toggleFullscreen}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-black/20" />
            <button
              type="button"
              onClick={() => setStarted(true)}
              aria-label="Play video"
              className="absolute inset-0 flex cursor-pointer items-center justify-center"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white/20 transition-transform duration-200 group-hover:scale-105">
                <Play className="size-7 translate-x-0.5" />
              </span>
            </button>
          </>
        )}
      </div>
    </figure>
  );
}
