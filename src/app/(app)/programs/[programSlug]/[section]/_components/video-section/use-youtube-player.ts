/// <reference types="youtube" />
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveVideoPositionAction } from "@/actions/program";

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const SKIP_SECONDS = 10;
const TICK_MS = 500;
const SAVE_INTERVAL_MS = 30000;

// One-time, promise-based loader for the IFrame Player API script. Repeated
// calls share the same promise so the script is only ever injected once.
let apiPromise: Promise<typeof YT> | null = null;

function loadYouTubeApi(): Promise<typeof YT> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT as typeof YT);
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return apiPromise;
}

interface UseYouTubePlayerOptions {
  videoId: string;
  sectionId: string;
  startSeconds: number;
  // Mount the player. False keeps the thumbnail up until the user hits play.
  enabled: boolean;
}

export function useYouTubePlayer({
  videoId,
  sectionId,
  startSeconds,
  enabled,
}: UseYouTubePlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds);
  const [duration, setDuration] = useState(0);

  // Latest known position, so the periodic/unmount saves read a live value
  // without re-subscribing effects on every tick.
  const positionRef = useRef(startSeconds);
  const lastSavedRef = useRef(Math.floor(startSeconds));

  // When resuming, a cued player only shows the video's default poster, not
  // the frame the user left off at. To render the resume frame while paused we
  // briefly muted-autoplay to `start`, then pause + unmute on the first tick.
  const shouldPrime = Math.floor(startSeconds) > 0;
  const hasPrimedRef = useRef(!shouldPrime);

  const save = useCallback(
    (seconds: number) => {
      const rounded = Math.floor(seconds);
      if (rounded === lastSavedRef.current) return;
      lastSavedRef.current = rounded;
      void saveVideoPositionAction(sectionId, {
        videoPositionSeconds: rounded,
      }).catch(() => {
        // fire-and-forget: progress saving must never disrupt playback
      });
    },
    [sectionId],
  );

  // Create the player once enabled. YT replaces its target element with an
  // iframe, so we hand it a throwaway child div (never a React-managed node).
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    let cancelled = false;
    const host = containerRef.current;

    loadYouTubeApi().then((api) => {
      if (cancelled) return;

      const target = document.createElement("div");
      host.appendChild(target);

      playerRef.current = new api.Player(target, {
        videoId,
        // YT sets fixed width/height attributes on the generated iframe;
        // force it to fill our container instead.
        width: "100%",
        height: "100%",
        // These config enums (AutoPlay, Controls, …) exist only in the type
        // defs — the runtime YT object doesn't expose them — so use the raw
        // numeric values the API expects.
        playerVars: {
          autoplay: 1,
          mute: shouldPrime ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: Math.floor(startSeconds),
        } as YT.PlayerVars,
        events: {
          onReady: (event) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event) => {
            const player = event.target;
            const state = event.data;

            // First playback tick after a muted-autoplay prime: pause back to
            // the resume frame and restore sound for the user's real play.
            if (
              !hasPrimedRef.current &&
              state === api.PlayerState.PLAYING
            ) {
              hasPrimedRef.current = true;
              player.pauseVideo();
              player.unMute();
              setDuration(player.getDuration());
              setIsPlaying(false);
              return;
            }

            setIsPlaying(state === api.PlayerState.PLAYING);
            setDuration(player.getDuration());
            if (
              state === api.PlayerState.PAUSED ||
              state === api.PlayerState.ENDED
            ) {
              save(player.getCurrentTime());
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [enabled, videoId, startSeconds, save, shouldPrime]);

  // While playing: advance the displayed time and periodically persist it.
  useEffect(() => {
    if (!isPlaying) return;

    const tick = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const time = player.getCurrentTime();
      positionRef.current = time;
      setCurrentTime(time);
    }, TICK_MS);

    const saver = setInterval(() => save(positionRef.current), SAVE_INTERVAL_MS);

    return () => {
      clearInterval(tick);
      clearInterval(saver);
    };
  }, [isPlaying, save]);

  // Persist on tab hide and on unmount (navigation away), best-effort.
  useEffect(() => {
    if (!enabled) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save(positionRef.current);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      save(positionRef.current);
    };
  }, [enabled, save]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  }, [isPlaying]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const max = player.getDuration() || seconds;
    const clamped = Math.max(0, Math.min(seconds, max));
    player.seekTo(clamped, true);
    positionRef.current = clamped;
    setCurrentTime(clamped);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;
      seekTo(player.getCurrentTime() + delta);
    },
    [seekTo],
  );

  return {
    containerRef,
    isReady,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    play,
    seekTo,
    skip,
  };
}