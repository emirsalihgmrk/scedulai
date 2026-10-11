"use client";

import { BookmarkCheck, BookmarkPlus, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { saveTranscriptPhraseAction } from "@/actions/vocabulary";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { PhraseDefinition } from "@/schemas/vocabulary";

const MAX_PHRASE_WORDS = 6;

// Punctuation stuck to the first or last word ("up," / "“So") isn't part of
// the phrase; inner punctuation ("don't") is.
function trimPunctuation(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

interface SavePhrasePopoverProps {
  sectionId: string;
  lineIndex: number;
  text: string;
  className?: string;
}

export default function SavePhrasePopover({
  sectionId,
  lineIndex,
  text,
  className,
}: SavePhrasePopoverProps) {
  const words = text.split(/\s+/).filter(Boolean);
  // The first tap picks a word, the second extends it to a range, and a third
  // starts over.
  const [anchor, setAnchor] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [definition, setDefinition] = useState<PhraseDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const range =
    anchor === null
      ? null
      : {
          from: Math.min(anchor, focus ?? anchor),
          to: Math.max(anchor, focus ?? anchor),
        };
  const phrase = range
    ? trimPunctuation(words.slice(range.from, range.to + 1).join(" "))
    : "";

  function handleWordTap(index: number) {
    setDefinition(null);
    setError(null);
    const isStartingOver =
      anchor === null ||
      focus !== null ||
      Math.abs(index - anchor) + 1 > MAX_PHRASE_WORDS;
    if (isStartingOver) {
      setAnchor(index);
      setFocus(null);
    } else {
      setFocus(index);
    }
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveTranscriptPhraseAction(sectionId, {
          lineIndex,
          phrase,
        });
        if (result.ok) {
          setDefinition(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Could not save, try again.");
      }
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Save a word from this line"
            className={cn(
              "opacity-0 group-hover/line:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100 [@media(hover:none)]:opacity-100",
              className,
            )}
          />
        }
      >
        <BookmarkPlus />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 gap-3 p-3">
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground">Save to vocabulary</p>
          <p className="text-xs text-muted-foreground">
            Tap a word, or the first and last word of a phrase.
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {words.map((word, index) => {
            const isSelected =
              range !== null && index >= range.from && index <= range.to;
            return (
              <Toggle
                key={index}
                size="sm"
                pressed={isSelected}
                onPressedChange={() => handleWordTap(index)}
                className="px-2 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {word}
              </Toggle>
            );
          })}
        </div>

        {definition ? (
          <div className="flex items-start gap-2 rounded-lg bg-success/10 p-2.5 text-success">
            <BookmarkCheck className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">{definition.phrase}</span>
              <span className="text-foreground/80"> · {definition.meaning}</span>
            </p>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={phrase.length === 0 || isPending}
            className="self-end"
          >
            {isPending ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Looking up…
              </>
            ) : (
              <>
                <BookmarkPlus data-icon="inline-start" />
                {phrase ? `Save “${phrase}”` : "Save"}
              </>
            )}
          </Button>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </PopoverContent>
    </Popover>
  );
}
