import { z } from "zod";

import { createVocabularyItemRowSchema } from "@/db/rows";
import type { VideoRow, VocabularyItemRow } from "@/db/rows";
import { glossSchema } from "@/schemas/quiz";

// ── Query types ──

export type VocabularyItemListItem = Pick<
  VocabularyItemRow,
  "id" | "phrase" | "meaning" | "context" | "timeSeconds" | "createdAt"
> & {
  video: Pick<VideoRow, "title"> | null;
};

// ── DAL input schemas ──

// Lowercased so the same phrase saved twice hits the (user, phrase) unique key.
export const createVocabularyItemSchema = createVocabularyItemRowSchema
  .pick({ phrase: true, meaning: true, context: true, timeSeconds: true })
  .extend({
    phrase: z.string().trim().toLowerCase().min(1).max(80),
    meaning: z.string().trim().min(1).max(120),
    context: z.string().trim().min(1).max(500),
    timeSeconds: z.int().min(0).nullish(),
  });
export type CreateVocabularyItemInput = z.infer<
  typeof createVocabularyItemSchema
>;

export const updateVocabularyItemSchema = createVocabularyItemSchema
  .pick({ meaning: true, context: true, timeSeconds: true })
  .partial();
export type UpdateVocabularyItemInput = z.infer<
  typeof updateVocabularyItemSchema
>;

// ── Service input schemas ──

// The server reads the line itself, so the client sends only which line and
// the words picked from it.
export const saveTranscriptPhraseSchema = createVocabularyItemSchema
  .pick({ phrase: true })
  .extend({ lineIndex: z.int().min(0) });
export type SaveTranscriptPhraseInput = z.infer<
  typeof saveTranscriptPhraseSchema
>;

// The gloss is looked up on the question by its native phrase.
export const saveGlossSchema = glossSchema.pick({ phrase: true });
export type SaveGlossInput = z.infer<typeof saveGlossSchema>;

// ── Service result types ──

export const phraseDefinitionSchema = createVocabularyItemSchema.pick({
  phrase: true,
  meaning: true,
});
export type PhraseDefinition = z.infer<typeof phraseDefinitionSchema>;
