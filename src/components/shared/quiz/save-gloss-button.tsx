"use client";

import { BookmarkCheck, BookmarkPlus, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

interface SaveGlossButtonProps {
  onSave: () => Promise<boolean>;
}

export default function SaveGlossButton({ onSave }: SaveGlossButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setHasFailed(false);
    startTransition(async () => {
      try {
        const isOk = await onSave();
        setIsSaved(isOk);
        setHasFailed(!isOk);
      } catch {
        setHasFailed(true);
      }
    });
  }

  if (isSaved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <BookmarkCheck className="size-3.5" />
        Saved to vocabulary
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <BookmarkPlus data-icon="inline-start" />
        )}
        Save to vocabulary
      </Button>
      {hasFailed && (
        <span className="text-xs text-destructive">Could not save, try again.</span>
      )}
    </div>
  );
}
