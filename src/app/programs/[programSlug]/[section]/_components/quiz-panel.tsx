"use client";

import { use, useState, useTransition } from "react";
import {
  GraduationCap,
  CircleCheck,
  Clock,
  Gauge,
  Sparkles,
  ArrowRight,
  Languages,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  PencilLine,
  BookOpen,
  Lightbulb,
  FileQuestion,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Question, QuizWithQuestions } from "@/schemas/quiz";
import { EmptyState } from "./empty-state";
import { submitAnswerAction } from "@/actions/quiz";

const SOURCE_LANG = "Türkçe";
const TARGET_LANG = "English";

function accuracyClasses(accuracy: number) {
  return accuracy < 75
    ? "bg-warning/12 text-warning-foreground"
    : "bg-success/12 text-success";
}

function OverviewStep({
  quiz,
  questions,
  answered,
  unanswered,
  progress,
  onStart,
  onGoTo,
}: {
  quiz: QuizWithQuestions;
  questions: Question[];
  answered: number;
  unanswered: number;
  progress: number;
  onStart: () => void;
  onGoTo: (index: number) => void;
}) {
  const total = quiz.questions.length;

  const gradedQuestions = questions.filter((q) => q.answerAccuracy !== null);
  const avgAccuracy =
    gradedQuestions.length > 0
      ? Math.round(
          gradedQuestions.reduce((sum, q) => sum + (q.answerAccuracy ?? 0), 0) /
            gradedQuestions.length,
        )
      : null;

  return (
    <>
      <CardHeader className="shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2.5 pt-6">
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
            CEFR: {quiz.cefrLevel}
          </Badge>
        </CardAction>
      </CardHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-2">
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

        {avgAccuracy !== null && (
          <div
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${accuracyClasses(avgAccuracy)}`}
          >
            <span className="text-sm font-medium">Avg. accuracy</span>
            <span className="font-display text-lg font-bold tabular-nums">
              {avgAccuracy}%
            </span>
          </div>
        )}

        {questions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Questions
            </p>
            <ul className="flex flex-col gap-1.5">
              {questions.map((q, i) => {
                const isGraded = q.answerAccuracy !== null;
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => onGoTo(i + 1)}
                      className="flex w-full items-start gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left transition-colors hover:bg-muted/60"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-[13px] leading-snug text-foreground/80">
                        {q.payload.sourceSentence}
                      </span>
                      {isGraded && (
                        <span
                          className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums ${accuracyClasses(q.answerAccuracy ?? 0)}`}
                        >
                          {q.answerAccuracy}%
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-5 sm:p-6">
        <Button
          type="button"
          size="lg"
          disabled={total === 0}
          onClick={onStart}
          className="h-12 w-full text-sm"
        >
          Start practice
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </>
  );
}

function SourceSentence({ question }: { question: Question }) {
  return (
    <div className="rounded-xl bg-secondary/70 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        AI-generated from transcript
      </div>
      <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
        {question.payload.sourceSentence}
      </p>
    </div>
  );
}

function AnswerInput({
  question,
  value,
  onChange,
  onSubmit,
  isPending,
  error,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-5 sm:px-6">
      <SourceSentence question={question} />

      <Field>
        <FieldLabel htmlFor={`translation-${question.id}`}>
          Your translation
        </FieldLabel>
        <Textarea
          id={`translation-${question.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Type your English translation here..."
          className="resize-none"
          disabled={isPending}
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        disabled={value.trim().length === 0 || isPending}
        onClick={onSubmit}
        className="h-12 w-full text-sm"
      >
        {isPending ? (
          <>
            <Loader2 data-icon="inline-start" className="animate-spin" />
            Grading…
          </>
        ) : (
          <>
            <Sparkles data-icon="inline-start" />
            Submit Translation
          </>
        )}
      </Button>
    </div>
  );
}

function GradedQuestion({
  question,
  flipped,
  onFlip,
}: {
  question: Question;
  flipped: boolean;
  onFlip: (flipped: boolean) => void;
}) {
  const analysis = question.answerAnalysis;
  const accuracy = question.answerAccuracy ?? 0;
  const userTranslation =
    question.answer?.type === "translation"
      ? question.answer.userTranslation
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

function QuestionStep({
  question,
  index,
  total,
  cefrLevel,
  value,
  onChange,
  onOverview,
  onPrev,
  onNext,
  onGraded,
}: {
  question: Question;
  index: number;
  total: number;
  cefrLevel: string;
  value: string;
  onChange: (value: string) => void;
  onOverview: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGraded: (question: Question) => void;
}) {
  const isLast = index === total;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const isGraded = question.answerAnalysis !== null;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitAnswerAction(question.id, question.payload, {
          type: "translation",
          userTranslation: value,
        });
        if (result.ok) {
          onGraded(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Değerlendirme başarısız oldu, lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <>
      <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-primary/10 text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Question {index} / {total}
          </Badge>
          <Badge className="bg-warning/15 font-semibold text-warning-foreground ring-1 ring-inset ring-warning/30">
            {cefrLevel}
          </Badge>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Languages className="size-3.5" />
          {SOURCE_LANG}
          <ArrowRight className="size-3" />
          {TARGET_LANG}
        </span>
      </div>

      {isGraded ? (
        <GradedQuestion
          question={question}
          flipped={flipped}
          onFlip={setFlipped}
        />
      ) : (
        <AnswerInput
          question={question}
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        />
      )}

      {/* Navigation between questions on the same card */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border p-5 sm:p-6">
        <Button
          type="button"
          variant="outline"
          onClick={onOverview}
          className="gap-1.5"
        >
          <Gauge data-icon="inline-start" />
          Overview
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={index === 1}
            className="gap-1.5"
          >
            <ChevronLeft data-icon="inline-start" />
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onNext}
            disabled={isLast}
            className="gap-1.5"
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </>
  );
}

function QuizContent({ quiz }: { quiz: QuizWithQuestions }) {
  const total = quiz.questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, Question>>({});

  const questions = quiz.questions.map((q) => graded[q.id] ?? q);
  const answered = questions.filter((q) => q.answer !== null).length;
  const unanswered = total - answered;
  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  const isOverview = step === 0;
  const question = isOverview ? undefined : questions[step - 1];

  return (
    <div className="sticky top-20">
      <Card
        aria-label="Translation quiz"
        className={`relative flex h-[80vh] flex-col gap-0 overflow-hidden py-0`}
      >
        {/* Active accent bar (shown while answering a question) */}
        {!isOverview && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />
        )}

        {isOverview || !question ? (
          <OverviewStep
            quiz={quiz}
            questions={questions}
            answered={answered}
            unanswered={unanswered}
            progress={progress}
            onStart={() => setStep(1)}
            onGoTo={setStep}
          />
        ) : (
          <QuestionStep
            key={question.id}
            question={question}
            index={step}
            total={total}
            cefrLevel={quiz.cefrLevel}
            value={answers[question.id] ?? ""}
            onChange={(value) =>
              setAnswers((prev) => ({ ...prev, [question.id]: value }))
            }
            onOverview={() => setStep(0)}
            onPrev={() => setStep((s) => s - 1)}
            onNext={() => setStep((s) => Math.min(s + 1, total))}
            onGraded={(q) => setGraded((prev) => ({ ...prev, [q.id]: q }))}
          />
        )}
      </Card>
    </div>
  );
}

export function QuizPanel({
  quizPromise,
}: {
  quizPromise: Promise<QuizWithQuestions | null>;
}) {
  const quiz = use(quizPromise);

  if (!quiz) {
    return (
      <div className="sticky top-20">
        <EmptyState
          icon={FileQuestion}
          title="Quiz hazırlanamadı"
          description="Bu section'a bağlı bir video/transkript olmadığı için quiz üretilemedi."
          className="h-[80vh]"
        />
      </div>
    );
  }

  return <QuizContent quiz={quiz} />;
}

export function QuizPanelFallback() {
  return (
    <div className="sticky top-20">
      <div className="flex h-[80vh] flex-col items-center justify-center gap-5 rounded-xl border border-border p-6 text-center">
        {/* Pulsing AI badge */}
        <span className="relative flex size-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-7 animate-pulse" />
          </span>
        </span>

        <div className="flex flex-col gap-1.5">
          <p className="bg-linear-to-r from-primary to-chart-5 bg-clip-text font-display text-lg font-semibold text-transparent">
            Quiz is being prepared with AI
          </p>
          <p className="text-sm text-muted-foreground">
            Personalized translation sentences are being generated from your
            transcript...
          </p>
        </div>

        {/* Bouncing dots */}
        <span className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
