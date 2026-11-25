import { clsx  } from "clsx";
import type {ClassValue} from "clsx";
import { twMerge } from "tailwind-merge";

import type { Gloss } from "@/schemas/quiz";

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

// Glosses come from the model, so one is kept only when both its forms are in
// their sentences: every stored gloss can then be underlined and saved with
// its in-context form. An English lemma the sentence uses ("meeting") stands
// in for a missing in-context form, and the sentence's own spelling is kept.
export function keepLocatableGlosses(
  sourceSentence: string,
  expectedTranslation: string,
  glosses: Gloss[],
): Gloss[] {
  return glosses.flatMap((gloss) => {
    if (!gloss.nativeInContext.trim()) return [];
    if (!sourceSentence.includes(gloss.nativeInContext)) return [];
    for (const form of [gloss.englishInContext, gloss.englishLemma]) {
      const match = form.trim() ? matchPhrase(expectedTranslation, form) : null;
      if (match) return [{ ...gloss, englishInContext: match[0] }];
    }
    return [];
  });
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

// English nouns with a regular plural only ("3 words", "1 sentence").
export function pluralize(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}
