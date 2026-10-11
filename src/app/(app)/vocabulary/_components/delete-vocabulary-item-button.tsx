"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteVocabularyItemAction } from "@/actions/vocabulary";
import { Button } from "@/components/ui/button";

interface DeleteVocabularyItemButtonProps {
  vocabularyItemId: string;
  phrase: string;
}

export default function DeleteVocabularyItemButton({
  vocabularyItemId,
  phrase,
}: DeleteVocabularyItemButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteVocabularyItemAction(vocabularyItemId);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete “${phrase}”`}
      className="shrink-0 text-muted-foreground hover:text-destructive"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}
