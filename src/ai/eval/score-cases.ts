import {
  analyzeSentence,
  ANALYZE_SENTENCE_MODEL,
  ANALYZE_SENTENCE_PROMPT_VERSION,
} from "@/ai/tasks/analyze-sentence";
import { cases, type EvalCase, type Expectation } from "./analyze-sentence-cases";
import type { AnalyzeSentenceOutput } from "@/ai/tasks/analyze-sentence";

/**
 * Evaluates the grader against the curated golden dataset and prints a
 * pass/fail scorecard. Pure measurement: it never writes to `ai_traces`.
 *
 * Run:  npm run ai:eval:score
 */
function check(output: AnalyzeSentenceOutput, expected: Expectation): string[] {
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
  return reasons;
}

async function main() {
  console.log(
    `analyze-sentence scorer — model=${ANALYZE_SENTENCE_MODEL} promptVersion=${ANALYZE_SENTENCE_PROMPT_VERSION}\n`,
  );

  const byCategory = new Map<string, { pass: number; total: number }>();
  let passed = 0;

  for (const [i, c] of cases.entries()) {
    const input: EvalCase = c;
    const { output, accuracy } = await analyzeSentence({
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

    const tag = ok ? "PASS" : "FAIL";
    const detail = ok ? "" : `  <- ${reasons.join("; ")}`;
    const rubric = `meaning=${output.meaningPreserved} m=${output.mistakes.length} acc=${accuracy}`;
    console.log(
      `[${String(i + 1).padStart(2)}/${cases.length}] ${tag}  ${c.category} — ${c.note} (${rubric})${detail}`,
    );
  }

  console.log(`\nScorecard (${passed}/${cases.length} passed):`);
  for (const [cat, { pass, total }] of byCategory) {
    console.log(`  ${cat.padEnd(14)} ${pass}/${total}`);
  }

  process.exit(passed === cases.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
