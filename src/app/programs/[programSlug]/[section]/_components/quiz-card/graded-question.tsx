import {
  CircleCheck,
  PencilLine,
  RotateCcw,
  ChevronLeft,
  Sparkles,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionWithAnswer } from "@/schemas/quiz";
import { SourceSentence } from "./source-sentence";
import { accuracyClasses } from "./utils";

export function GradedQuestion({
  question,
  flipped,
  onFlip,
}: {
  question: QuestionWithAnswer;
  flipped: boolean;
  onFlip: (flipped: boolean) => void;
}) {
  const analysis = question.answer?.analysis;
  const accuracy = question.answer?.accuracy ?? 0;
  const userTranslation =
    question.answer?.response?.type === "translation"
      ? question.answer.response.userTranslation
      : "";

  if (!analysis) return null;

  return (
    <div className="relative min-h-0 flex-1 perspective-distant">
      <div
        className={`relative size-full transition-transform duration-500 transform-3d ${
          flipped ? "transform-[rotateY(180deg)]" : ""
        }`}
      >
        {/* Front — kept question + answer + accuracy */}
        <div className="absolute inset-0 flex flex-col gap-4 overflow-y-auto px-5 backface-hidden sm:px-6">
          <SourceSentence question={question} />

          <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <PencilLine className="size-3.5" />
                Your translation
              </div>
              <p className="text-[15px] leading-relaxed text-foreground">
                {userTranslation}
              </p>
            </div>
            <span
              className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 ${accuracyClasses(accuracy)}`}
            >
              <span className="font-display text-lg font-bold leading-none">
                {accuracy}%
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Accuracy
              </span>
            </span>
          </div>

          {question.payload.type === "translation" && (
            <div className="rounded-xl border border-success/30 bg-success/8 p-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
                <CircleCheck className="size-3.5" />
                Original Sentence
              </div>
              <p className="text-[15px] leading-relaxed text-foreground">
                {question.payload.expectedTranslation}
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => onFlip(true)}
            className="gap-1.5"
          >
            <RotateCcw data-icon="inline-start" />
            Show AI analysis
          </Button>
        </div>

        {/* Back — full AI analysis */}
        <div className="absolute inset-0 flex flex-col gap-3 overflow-y-auto px-5 pb-5 backface-hidden transform-[rotateY(180deg)] sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-4" />
              AI Grammar &amp; Style Analysis
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 font-display text-sm font-bold ${accuracyClasses(accuracy)}`}
            >
              {accuracy}%
            </span>
          </div>

          <p className="text-[13px] leading-relaxed text-foreground/90">
            {analysis.analysis}
          </p>

          {analysis.mistakes.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-destructive">
                Mistakes ({analysis.mistakes.length})
              </p>
              <ul className="space-y-1.5">
                {analysis.mistakes.map((mistake, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[13px] leading-relaxed text-foreground/90"
                  >
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.alternatives.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="size-3.5" />
                Alternative phrasings
              </div>
              <ul className="space-y-1">
                {analysis.alternatives.map((alt, i) => (
                  <li
                    key={i}
                    className="text-[13px] leading-relaxed text-foreground/90 before:mr-1.5 before:text-muted-foreground before:content-['·']"
                  >
                    {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.expressions && analysis.expressions.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <BookOpen className="size-3.5" />
                Key expressions
              </div>
              <ul className="space-y-1">
                {analysis.expressions.map((expr, i) => (
                  <li
                    key={i}
                    className="text-[13px] leading-relaxed text-foreground/90"
                  >
                    {expr}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onFlip(false)}
            className="mt-1 gap-1.5 self-start"
          >
            <ChevronLeft data-icon="inline-start" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
