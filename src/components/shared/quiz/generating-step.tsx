import { Sparkles } from "lucide-react";

interface GeneratingStepProps {
  title: string;
  description: string;
}

export default function GeneratingStep({
  title,
  description,
}: GeneratingStepProps) {
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
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
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
