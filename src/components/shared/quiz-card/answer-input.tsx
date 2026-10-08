import { Loader2, Sparkles } from "lucide-react";

import SourceSentence from "@/components/shared/quiz-card/source-sentence";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/schemas/quiz";

interface AnswerInputProps {
  question: Question;
  sourceLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
}

export default function AnswerInput({
  question,
  sourceLabel,
  value,
  onChange,
  onSubmit,
  isPending,
  error,
}: AnswerInputProps) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-5 sm:px-6">
      <SourceSentence question={question} label={sourceLabel} />

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
