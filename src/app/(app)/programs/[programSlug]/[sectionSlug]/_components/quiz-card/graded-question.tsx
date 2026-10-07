import {
  ChevronLeft,
  CircleCheck,
  CircleX,
  Lightbulb,
  PencilLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, TranslationGrade } from "@/schemas/quiz";

import SourceSentence from "./source-sentence";

const VERDICT_CLASSES = {
  correct: "bg-success/12 text-success",
  incorrect: "bg-warning/12 text-warning-foreground",
} as const;

interface GradedQuestionProps {
  question: Question;
  grade: TranslationGrade;
  isFlipped: boolean;
  onFlip: (isFlipped: boolean) => void;
}

export default function GradedQuestion({
  question,
  grade,
  isFlipped,
  onFlip,
}: GradedQuestionProps) {
  const { userTranslation, analysis, isCorrect } = grade;
  const verdictClasses = VERDICT_CLASSES[isCorrect ? "correct" : "incorrect"];
  const VerdictIcon = isCorrect ? CircleCheck : CircleX;

  return (
    <div className="relative min-h-0 flex-1 perspective-distant">
      <div
        className={cn(
          "relative size-full transition-transform duration-500 transform-3d",
          isFlipped && "transform-[rotateY(180deg)]",
        )}
      >
        {/* Front — question + answer + verdict */}
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
              className={cn(
                "flex shrink-0 flex-col items-center rounded-xl px-3 py-2",
                verdictClasses,
              )}
            >
              <VerdictIcon className="size-5" />
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </span>
          </div>

          <div className="rounded-xl border border-success/30 bg-success/8 p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
              <CircleCheck className="size-3.5" />
              Original Sentence
            </div>
            <p className="text-[15px] leading-relaxed text-foreground">
              {question.payload.expectedTranslation}
            </p>
          </div>

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
              className={cn(
                "rounded-lg px-2.5 py-1 font-display text-sm font-bold",
                verdictClasses,
              )}
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </span>
          </div>

          {analysis.description && (
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {analysis.description}
            </p>
          )}

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
