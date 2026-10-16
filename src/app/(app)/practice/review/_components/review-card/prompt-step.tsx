import { Check, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { VocabularyItemListItem } from "@/schemas/vocabulary";

import { splitContext } from "./utils";

interface PromptStepProps {
  item: VocabularyItemListItem;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function PromptStep({
  item,
  value,
  onChange,
  onSubmit,
}: PromptStepProps) {
  const parts = splitContext(item.context, item.contextPhrase);

  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Meaning
        </p>
        <p className="font-display text-2xl font-bold text-foreground">
          {item.meaning}
        </p>
      </div>

      {parts ? (
        <p className="rounded-xl bg-muted/60 p-4 text-[15px] italic leading-loose text-foreground/90">
          {parts.before}
          <MaskedPhrase phrase={parts.phrase} />
          {parts.after}
        </p>
      ) : (
        // The sentence would give the answer away, so it waits for the result.
        <p className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <EyeOff className="size-4 shrink-0" />
          The sentence you saved it from is shown after you answer.
        </p>
      )}

      <Field className="mt-auto">
        <FieldLabel htmlFor={`answer-${item.id}`}>The English word</FieldLabel>
        <Input
          id={`answer-${item.id}`}
          size="lg"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type it in English..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={value.trim().length === 0}
        className="h-12 w-full text-sm"
      >
        <Check data-icon="inline-start" />
        Check
      </Button>
    </form>
  );
}

interface MaskedPhraseProps {
  phrase: string;
}

// One blank per word: the word count is a fair hint, the letters are not.
function MaskedPhrase({ phrase }: MaskedPhraseProps) {
  const words = phrase.split(/\s+/);
  return (
    <>
      <span className="sr-only">
        ({words.length} hidden {words.length === 1 ? "word" : "words"})
      </span>
      <span aria-hidden>
        {words.map((_, index) => (
          <span key={index}>
            {index > 0 && " "}
            <span className="inline-block h-5 w-12 translate-y-1 rounded-md border-b-2 border-primary/60 bg-primary/10" />
          </span>
        ))}
      </span>
    </>
  );
}
