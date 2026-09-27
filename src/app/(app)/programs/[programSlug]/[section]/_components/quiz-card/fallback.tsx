import { Gauge, Sparkles } from "lucide-react";

export default function QuizCardFallback() {
  return (
    <div className="sticky top-20">
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 p-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Gauge className="size-5 text-muted-foreground/40" />
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 pt-2">
          {/* Stat boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 animate-pulse rounded-xl bg-muted" />
            <div className="h-11 animate-pulse rounded-xl bg-muted" />
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 animate-pulse rounded-full bg-muted" />
          </div>

          {/* Question list */}
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
            <div className="flex flex-col gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border px-3.5 py-3"
                >
                  <span className="mt-0.5 size-5 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer button */}
        <div className="shrink-0 border-t border-border p-5 sm:p-6">
          <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function QuizGenerating() {
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
