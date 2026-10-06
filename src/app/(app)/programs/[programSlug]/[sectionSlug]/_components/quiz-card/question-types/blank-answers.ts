import type { FillInTheBlankPayload } from "@/schemas/quiz";

export type IndexedSegment =
  | { kind: "text"; value: string }
  | { kind: "blank"; answer: string; index: number };

// The quiz card keeps one draft string per question, so a fill-in-the-blank
// draft is the JSON-encoded answer list ("" = still empty).
export function parseBlankAnswers(value: string, blankCount: number): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.length === blankCount &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed;
    }
  } catch {
    // An empty or stale draft falls through to a fresh, empty answer list.
  }
  return Array.from({ length: blankCount }, () => "");
}

export function serializeBlankAnswers(answers: string[]): string {
  return JSON.stringify(answers);
}

// Numbers the blanks so renderers can map a segment to its answer / result.
export function indexSegments(
  segments: FillInTheBlankPayload["segments"],
): IndexedSegment[] {
  let blankIndex = 0;
  return segments.map((segment) =>
    segment.kind === "text"
      ? segment
      : { kind: "blank", answer: segment.answer, index: blankIndex++ },
  );
}
