import { Library } from "lucide-react";

export function ProgramsHeader() {
  return (
    <div className="flex flex-col gap-3">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wider text-secondary-foreground uppercase">
        <Library className="size-3.5" />
        Programs
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight font-bold text-balance text-foreground sm:text-4xl">
          Pick a program, learn 15 sentences a day
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Each program turns real video transcripts into daily translation
          practice, tuned to a CEFR level. Choose one to begin your streak.
        </p>
      </div>
    </div>
  );
}