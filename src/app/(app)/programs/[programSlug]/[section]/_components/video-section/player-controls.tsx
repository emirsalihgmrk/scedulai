"use client";

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Rewind,
  FastForward,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { SKIP_SECONDS } from "./use-youtube-player";

interface PlayerControlsProps {
  isPlaying: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSkip: (delta: number) => void;
  onSeek: (seconds: number) => void;
  onToggleFullscreen: () => void;
}

const iconButton = cn(
  "flex size-9 shrink-0 items-center justify-center rounded-md text-white/90",
  "transition-colors hover:bg-white/15 hover:text-white cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
);

export function PlayerControls({
  isPlaying,
  isFullscreen,
  currentTime,
  duration,
  onTogglePlay,
  onSkip,
  onSeek,
  onToggleFullscreen,
}: PlayerControlsProps) {
  const playedPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="flex items-center gap-2 bg-linear-to-t from-black/80 to-black/20 px-3 py-2.5">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={iconButton}
      >
        {isPlaying ? (
          <Pause className="size-5" />
        ) : (
          <Play className="size-5 translate-x-px" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onSkip(-SKIP_SECONDS)}
        aria-label={`Rewind ${SKIP_SECONDS} seconds`}
        className={iconButton}
      >
        <Rewind className="size-5" />
      </button>

      <button
        type="button"
        onClick={() => onSkip(SKIP_SECONDS)}
        aria-label={`Forward ${SKIP_SECONDS} seconds`}
        className={iconButton}
      >
        <FastForward className="size-5" />
      </button>

      <input
        type="range"
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(currentTime, duration || currentTime)}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="Seek"
        style={{
          background: `linear-gradient(to right, var(--color-primary) ${playedPercent}%, rgb(255 255 255 / 0.25) ${playedPercent}%)`,
        }}
        className={cn(
          "h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          "[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow",
          "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary",
        )}
      />

      <span className="shrink-0 text-xs font-medium tabular-nums text-white/80">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>

      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
        className={iconButton}
      >
        {isFullscreen ? (
          <Minimize className="size-5" />
        ) : (
          <Maximize className="size-5" />
        )}
      </button>
    </div>
  );
}