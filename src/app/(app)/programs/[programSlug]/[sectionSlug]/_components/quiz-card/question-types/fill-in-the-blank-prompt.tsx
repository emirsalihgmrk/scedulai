import { Sparkles } from "lucide-react";

import type { FillInTheBlankPayload } from "@/schemas/quiz";

interface FillInTheBlankPromptProps {
  payload: FillInTheBlankPayload;
}

export default function FillInTheBlankPrompt({
  payload,
}: FillInTheBlankPromptProps) {
  const blankCount = payload.segments.filter(
    (segment) => segment.kind === "blank",
  ).length;

  return (
    <div className="rounded-xl bg-secondary/70 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        AI-generated from transcript
      </div>
      <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
        Fill in the {blankCount === 1 ? "missing word" : "missing words"}
      </p>
    </div>
  );
}
