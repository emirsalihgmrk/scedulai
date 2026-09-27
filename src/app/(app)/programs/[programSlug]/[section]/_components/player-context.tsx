"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

type SeekFn = (seconds: number) => void;

interface PlayerControls {
  // Called by the transcript to jump the video to a timestamp.
  seek: SeekFn;
  // The player registers its seek handler here (null on unmount).
  registerSeek: (fn: SeekFn | null) => void;
  // The player pushes its playback position so consumers can follow along.
  reportTime: (seconds: number) => void;
}

// Split into two contexts so the high-frequency time updates don't re-render
// consumers that only need the stable imperative controls (i.e. the player).
const ControlsContext = createContext<PlayerControls | null>(null);
const TimeContext = createContext(0);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const seekRef = useRef<SeekFn | null>(null);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const controls = useMemo<PlayerControls>(
    () => ({
      seek: (seconds) => seekRef.current?.(seconds),
      registerSeek: (fn) => {
        seekRef.current = fn;
      },
      reportTime: setCurrentTimeSeconds,
    }),
    [],
  );

  return (
    <ControlsContext.Provider value={controls}>
      <TimeContext.Provider value={currentTimeSeconds}>
        {children}
      </TimeContext.Provider>
    </ControlsContext.Provider>
  );
}

export function usePlayerControls(): PlayerControls {
  const ctx = useContext(ControlsContext);
  if (!ctx) {
    throw new Error("usePlayerControls must be used within a PlayerProvider");
  }
  return ctx;
}

export function usePlaybackTime(): number {
  return useContext(TimeContext);
}
