"use client";

import { useState } from "react";
import {
  GraduationCap,
  CircleCheck,
  Clock,
  Gauge,
  Sparkles,
  ArrowRight,
  Languages,
  PencilLine,
  Quote,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { activeQuiz, answeredQuiz } from "@/lib/data";

function QuizCardActive() {
  const [value, setValue] = useState("");

  return (
    <Card className="relative gap-0 py-0 ring-2 ring-primary/25">
      {/* Active accent bar */}
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />

      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="gap-1.5 bg-primary/10 text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Question {activeQuiz.index} · To answer
            </Badge>
            <Badge className="bg-warning/15 font-semibold text-warning-foreground ring-1 ring-inset ring-warning/30">
              {activeQuiz.cefrLevel}
            </Badge>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Languages className="size-3.5" />
            {activeQuiz.sourceLang}
            <ArrowRight className="size-3" />
            {activeQuiz.targetLang}
          </span>
        </div>

        {/* AI generated source sentence */}
        <div className="rounded-xl bg-secondary/70 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            AI-generated from transcript
          </div>
          <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
            {activeQuiz.sentence}
          </p>
        </div>

        {/* Input */}
        <Field>
          <FieldLabel htmlFor="translation">Your translation</FieldLabel>
          <Textarea
            id="translation"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder="Type your English translation here..."
            className="resize-none"
          />
        </Field>

        {/* Submit */}
        <Button
          type="button"
          size="lg"
          disabled={value.trim().length === 0}
          className="h-12 w-full text-sm"
        >
          <Sparkles data-icon="inline-start" />
          Submit Translation
        </Button>
      </CardContent>
    </Card>
  );
}

function QuizCardAnswered() {
  const q = answeredQuiz;

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
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {q.analysis}
            </p>

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

            <div className="rounded-lg bg-card p-3 text-sm ring-1 ring-border">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Original sentence
              </p>
              <p className="text-[15px] font-medium leading-relaxed text-foreground">
                &ldquo;{q.originalSentence}&rdquo;
              </p>
            </div>

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

export function QuizPanel() {
  const answered = 3;
  const unanswered = 2;
  const total = answered + unanswered;
  const progress = Math.round((answered / total) * 100);

  return (
    <div className="flex min-h-0 flex-col gap-5">
      {/* Overview bar */}
      <Card aria-label="Quiz overview" className="gap-4">
        <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Gauge className="size-5" />
          </span>
          <div className="leading-tight">
            <CardTitle className="font-display">Translation Quiz</CardTitle>
            <CardDescription className="text-xs">
              Generated from this talk
            </CardDescription>
          </div>
          <CardAction className="row-span-1 self-center">
            <Badge className="gap-1.5 bg-warning/15 font-bold text-warning-foreground ring-1 ring-inset ring-warning/30">
              <GraduationCap />
              CEFR: B1
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-success/10 px-3 py-2.5">
              <CircleCheck className="size-4 text-success" />
              <span className="text-sm font-medium text-foreground">
                Answered:{" "}
                <span className="font-bold tabular-nums">{answered}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Unanswered:{" "}
                <span className="font-bold tabular-nums">{unanswered}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>Progress</span>
              <span className="tabular-nums">
                {answered} / {total}
              </span>
            </div>
            <Progress
              value={progress}
              className="**:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-primary **:data-[slot=progress-indicator]:to-chart-5 **:data-[slot=progress-track]:h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        <QuizCardActive />
        <QuizCardAnswered />
      </div>
    </div>
  );
}