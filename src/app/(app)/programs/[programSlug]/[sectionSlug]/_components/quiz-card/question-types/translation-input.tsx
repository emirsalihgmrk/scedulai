"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { submitTranslationAnswerAction } from "@/actions/quiz";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionWithAnswer, TranslationPayload } from "@/schemas/quiz";

import TranslationPrompt from "./translation-prompt";

interface TranslationInputProps {
  question: QuestionWithAnswer;
  payload: TranslationPayload;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}

// Ungraded translation question: owns its submission (action call + pending /
// error state) so the generic question step stays type-agnostic.
export default function TranslationInput({
  question,
  payload,
  value,
  onChange,
  onGraded,
}: TranslationInputProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitTranslationAnswerAction(question.id, {
          userTranslation: value,
        });
        if (result.ok) {
          onGraded(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Evaluation failed, please try again.");
      }
    });
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-5 sm:px-6">
      <TranslationPrompt payload={payload} />

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
        onClick={handleSubmit}
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
