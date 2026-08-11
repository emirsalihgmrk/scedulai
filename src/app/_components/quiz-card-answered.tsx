import {
  CircleCheck,
  Sparkles,
  ArrowRight,
  PencilLine,
  Quote,
  Languages,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { answeredQuiz } from "@/lib/data";

export function QuizCardAnswered() {
  const q = answeredQuiz;
  const hasIssues = q.mistakes.length > 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">
              <CircleCheck className="size-3.5" />
              Question {q.index} · Completed
            </span>
            <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning-foreground ring-1 ring-inset ring-warning/30">
              {q.cefrLevel}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Languages className="size-3.5" />
            {q.sourceLang}
            <ArrowRight className="size-3" />
            {q.targetLang}
          </span>
        </div>

        {/* Source sentence (native) */}
        <div className="mt-4 rounded-xl bg-secondary/70 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Quote className="size-3.5" />
            Source phrase
          </div>
          <p className="text-pretty font-display text-base font-medium leading-snug text-foreground">
            {q.sentence}
          </p>
        </div>

        {/* User translation + accuracy */}
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <PencilLine className="size-3.5" />
              Your translation
            </div>
            <p className="text-[15px] leading-relaxed text-foreground">
              {q.userTranslation}
            </p>
          </div>
          <span
            className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 ${q.accuracy < 75 ? "bg-warning/12 text-warning-foreground" : "bg-success/12 text-success"}`}
          >
            <span className="font-display text-lg font-bold leading-none">
              {q.accuracy}%
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Accuracy
            </span>
          </span>
        </div>

        {/* AI Analysis */}
        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/4 p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-4" />
            AI Grammar &amp; Style Analysis
          </div>

          <div className="space-y-3">
            {/* Educational analysis */}
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {q.analysis}
            </p>

            {/* Mistakes */}
            {q.mistakes.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-destructive">
                  Mistakes ({q.mistakes.length})
                </p>
                <ul className="space-y-1.5">
                  {q.mistakes.map((m, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] leading-relaxed text-foreground/90"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Original sentence */}
            <div className="rounded-lg bg-card p-3 text-sm ring-1 ring-border">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Original sentence
              </p>
              <p className="text-[15px] font-medium leading-relaxed text-foreground">
                &ldquo;{q.originalSentence}&rdquo;
              </p>
            </div>

            {/* Alternatives */}
            {q.alternatives.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="size-3.5" />
                  Alternative phrasings
                </div>
                <ul className="space-y-1">
                  {q.alternatives.map((alt, i) => (
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

            {/* Expressions */}
            {q.expressions.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <BookOpen className="size-3.5" />
                  Key expressions
                </div>
                <ul className="space-y-1">
                  {q.expressions.map((expr, i) => (
                    <li
                      key={i}
                      className="text-[13px] leading-relaxed text-foreground/90"
                    >
                      <span className="font-semibold text-foreground">
                        {expr.split(" — ")[0]}
                      </span>
                      {expr.includes(" — ") && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {expr.split(" — ")[1]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
