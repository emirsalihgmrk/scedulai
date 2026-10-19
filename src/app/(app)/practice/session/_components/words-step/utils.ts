import { matchPhrase } from "@/lib/utils";
import type { VocabularyItemListItem } from "@/schemas/vocabulary";

interface ContextParts {
  before: string;
  phrase: string;
  after: string;
}

// Case, punctuation and curly apostrophes don't make an answer wrong.
function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Both forms are right: the dictionary form asked for and the form the
// sentence uses ("give up" and "gave up").
export function isCorrectAnswer(
  answer: string,
  item: VocabularyItemListItem,
): boolean {
  const normalized = normalizeAnswer(answer);
  return [item.phrase, item.contextPhrase].some(
    (form) => form !== null && normalizeAnswer(form) === normalized,
  );
}

// Splits the sentence around the phrase so it can be masked or highlighted;
// null when the phrase can't be found in it.
export function splitContext(
  context: string,
  contextPhrase: string | null,
): ContextParts | null {
  if (!contextPhrase) return null;
  const match = matchPhrase(context, contextPhrase);
  if (!match) return null;
  return {
    before: context.slice(0, match.index),
    phrase: match[0],
    after: context.slice(match.index + match[0].length),
  };
}
