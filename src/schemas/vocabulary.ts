import { z } from "zod";

import {
  createVocabularyCardRowSchema,
  createVocabularyItemRowSchema,
  createVocabularyReviewRowSchema,
} from "@/db/rows";
import type { VideoRow, VocabularyCardRow, VocabularyItemRow } from "@/db/rows";
import { glossSchema } from "@/schemas/quiz";

// ── Query types ──

export type VocabularyItemListItem = Pick<
  VocabularyItemRow,
  | "id"
  | "phrase"
  | "meaning"
  | "context"
  | "contextPhrase"
  | "timeSeconds"
  | "createdAt"
> & {
  video: Pick<VideoRow, "title"> | null;
};

export type VocabularyCard = Pick<
  VocabularyCardRow,
  | "state"
  | "due"
  | "stability"
  | "difficulty"
  | "scheduledDays"
  | "learningSteps"
  | "reps"
  | "lapses"
  | "lastReviewedAt"
>;

export type VocabularyItemWithCard = Pick<VocabularyItemRow, "id"> & {
  card: VocabularyCard | null;
};

// ── DAL input schemas ──

// Lowercased so the same phrase saved twice hits the (user, phrase) unique key.
export const createVocabularyItemSchema = createVocabularyItemRowSchema
  .pick({
    phrase: true,
    meaning: true,
    context: true,
    contextPhrase: true,
    timeSeconds: true,
  })
  .extend({
    phrase: z.string().trim().toLowerCase().min(1).max(80),
    meaning: z.string().trim().min(1).max(120),
    context: z.string().trim().min(1).max(500),
    contextPhrase: z.string().trim().toLowerCase().min(1).max(80).nullish(),
    timeSeconds: z.int().min(0).nullish(),
  });
export type CreateVocabularyItemInput = z.infer<
  typeof createVocabularyItemSchema
>;

export const updateVocabularyItemSchema = createVocabularyItemSchema
  .pick({
    meaning: true,
    context: true,
    contextPhrase: true,
    timeSeconds: true,
  })
  .partial();
export type UpdateVocabularyItemInput = z.infer<
  typeof updateVocabularyItemSchema
>;

export const upsertVocabularyCardSchema = createVocabularyCardRowSchema.pick({
  state: true,
  due: true,
  stability: true,
  difficulty: true,
  scheduledDays: true,
  learningSteps: true,
  reps: true,
  lapses: true,
  lastReviewedAt: true,
});
export type UpsertVocabularyCardInput = z.infer<
  typeof upsertVocabularyCardSchema
>;

export const createVocabularyReviewSchema =
  createVocabularyReviewRowSchema.pick({ rating: true, state: true });
export type CreateVocabularyReviewInput = z.infer<
  typeof createVocabularyReviewSchema
>;

// ── Service input schemas ──

export const saveTranscriptPhraseSchema = createVocabularyItemSchema
  .pick({ phrase: true })
  .extend({ lineIndex: z.int().min(0) });
export type SaveTranscriptPhraseInput = z.infer<
  typeof saveTranscriptPhraseSchema
>;

export const saveGlossSchema = glossSchema.pick({ phrase: true });
export type SaveGlossInput = z.infer<typeof saveGlossSchema>;

export const reviewVocabularyItemSchema = createVocabularyReviewSchema
  .pick({ rating: true })
  .extend({ rating: z.enum(["again", "good"]) });
export type ReviewVocabularyItemInput = z.infer<
  typeof reviewVocabularyItemSchema
>;

// ── Service result types ──

export const phraseDefinitionSchema = createVocabularyItemSchema.pick({
  phrase: true,
  meaning: true,
});
export type PhraseDefinition = z.infer<typeof phraseDefinitionSchema>;
