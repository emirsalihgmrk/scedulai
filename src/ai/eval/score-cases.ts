import { cases } from "@/ai/eval/analyze-sentence-cases";
import type { EvalCase, Expectation } from "@/ai/eval/analyze-sentence-cases";
import {
  analyzeSentence,
  ANALYZE_SENTENCE_MODEL,
} from "@/ai/tasks/analyze-sentence";
import type { MistakeCategory } from "@/constants/mistake";
import type { TranslationAnalysis } from "@/schemas/quiz";

// Exact counts compare as a multiset, ranges as a set of distinct categories.
function categoriesMatch(
  actual: MistakeCategory[],
  expected: MistakeCategory[],
  exact: boolean,
): boolean {
  const normalize = (list: MistakeCategory[]) =>
    (exact ? [...list] : [...new Set(list)]).sort().join(",");
  return normalize(actual) === normalize(expected);
}

function check(output: TranslationAnalysis, expected: Expectation): string[] {
  const reasons: string[] = [];
  const mistakes = output.mistakes.length;

  if (output.meaningPreserved !== expected.meaning) {
    reasons.push(`meaning ${output.meaningPreserved} !== ${expected.meaning}`);
  }

  const [min, max] = Array.isArray(expected.mistakes)
    ? expected.mistakes
    : [expected.mistakes, expected.mistakes];
  if (mistakes < min || mistakes > max) {
    const want = min === max ? `${min}` : `${min}-${max}`;
    reasons.push(`mistakes ${mistakes} !== ${want}`);
  }

  if (expected.categories) {
    const actual = output.mistakes.map((mistake) => mistake.category);
    if (!categoriesMatch(actual, expected.categories, min === max)) {
      reasons.push(
        `categories [${actual.join(",")}] !== [${expected.categories.join(",")}]`,
      );
    }
  }
  return reasons;
}

async function main() {
  console.log(
    `analyze-sentence scorer — model=${ANALYZE_SENTENCE_MODEL}\n`,
  );

  const byCategory = new Map<string, { pass: number; total: number }>();
  const categoryAccuracy = { pass: 0, total: 0 };
  let passed = 0;

  for (const [i, c] of cases.entries()) {
    const input: EvalCase = c;
    const { output, isCorrect } = await analyzeSentence({
      sentence: input.sentence,
      originalSentence: input.originalSentence,
      userTranslation: input.userTranslation,
      nativeLanguage: input.nativeLanguage,
    });

    const reasons = check(output, c.expected);
    const ok = reasons.length === 0;
    if (ok) passed++;

    const cat = byCategory.get(c.category) ?? { pass: 0, total: 0 };
    cat.total++;
    if (ok) cat.pass++;
    byCategory.set(c.category, cat);

    if (c.expected.categories) {
      categoryAccuracy.total++;
      if (!reasons.some((reason) => reason.startsWith("categories"))) {
        categoryAccuracy.pass++;
      }
    }

    const tag = ok ? "PASS" : "FAIL";
    const detail = ok ? "" : `  <- ${reasons.join("; ")}`;
    const categories = output.mistakes.map((mistake) => mistake.category);
    const rubric = `meaning=${output.meaningPreserved} m=${output.mistakes.length} [${categories.join(",")}] correct=${isCorrect}`;
    console.log(
      `[${String(i + 1).padStart(2)}/${cases.length}] ${tag}  ${c.category} — ${c.note} (${rubric})${detail}`,
    );
  }

  console.log(`\nScorecard (${passed}/${cases.length} passed):`);
  for (const [cat, { pass, total }] of byCategory) {
    console.log(`  ${cat.padEnd(16)} ${pass}/${total}`);
  }
  console.log(
    `\nCategory accuracy: ${categoryAccuracy.pass}/${categoryAccuracy.total}`,
  );

  process.exit(passed === cases.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
