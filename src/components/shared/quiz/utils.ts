import type { Gloss } from "@/schemas/quiz";

export interface GlossedSegment {
  text: string;
  gloss: Gloss | null;
}

// The sentence a gloss is located in: its source sentence holds the native
// form, its expected translation the English one.
export type GlossForm = "nativeInContext" | "englishInContext";

// Glosses come from the model, so a form that isn't in the sentence verbatim,
// or overlaps an earlier one, is skipped rather than trusted.
export function splitByGlosses(
  sentence: string,
  glosses: Gloss[],
  form: GlossForm,
): GlossedSegment[] {
  const matches = glosses
    .flatMap((gloss) => {
      const text = gloss[form];
      const start = text ? sentence.indexOf(text) : -1;
      return start === -1 ? [] : [{ start, end: start + text.length, gloss }];
    })
    .sort((a, b) => a.start - b.start);

  const segments: GlossedSegment[] = [];
  let cursor = 0;
  for (const { start, end, gloss } of matches) {
    if (start < cursor) continue;
    if (start > cursor) {
      segments.push({ text: sentence.slice(cursor, start), gloss: null });
    }
    segments.push({ text: sentence.slice(start, end), gloss });
    cursor = end;
  }
  if (cursor < sentence.length) {
    segments.push({ text: sentence.slice(cursor), gloss: null });
  }
  return segments;
}