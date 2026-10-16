import { clsx  } from "clsx";
import type {ClassValue} from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateValue: string | Date | null | undefined) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Transcript timestamps are "MM:SS" (or "HH:MM:SS" for long videos).
export function parseTimestamp(time: string): number {
  return time.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);
}

// Whole words only, with any whitespace between them. Lookarounds instead of
// `\b`, which treats non-ASCII letters ("café") as word boundaries.
export function matchPhrase(
  text: string,
  phrase: string,
): RegExpExecArray | null {
  const pattern = phrase
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .split(/\s+/)
    .join("\\s+");
  return new RegExp(
    `(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`,
    "iu",
  ).exec(text);
}

export function formatDuration(totalSeconds: number | null | undefined) {
  if (totalSeconds == null || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}
