import { z } from "zod";

import {
  createVocabularyCardRowSchema,
  createVocabularyItemRowSchema,
  createVocabularyReviewRowSchema,
} from "@/db/rows";
import type {
  VideoRow,
  VocabularyCardRow,
  VocabularyItemRow,
  VocabularyReviewRow,
} from "@/db/rows";
import { glossSchema } from "@/schemas/quiz";

// ── Query types ──

export type VocabularyItemListItem = Pick<
  VocabularyItemRow,
  | "id"
  | "englishLemma"
  | "nativeLemma"
  | "context"
  | "englishInContext"
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

export type VocabularyCardListItem = Pick<
  VocabularyCardRow,
  "state" | "scheduledDays" | "due"
>;

export type VocabularyReviewListItem = Pick<
  VocabularyReviewRow,
  "rating" | "createdAt"
>;

// ── DAL input schemas ──

// Lowercased so the same phrase saved twice hits the (user, englishLemma)
// unique key.
export const createVocabularyItemSchema = createVocabularyItemRowSchema
  .pick({
    englishLemma: true,
    nativeLemma: true,
    context: true,
    englishInContext: true,
    timeSeconds: true,
  })
  .extend({
    englishLemma: z.string().trim().toLowerCase().min(1).max(80),
    nativeLemma: z.string().trim().min(1).max(120),
    context: z.string().trim().min(1).max(500),
    englishInContext: z.string().trim().toLowerCase().min(1).max(80),
    timeSeconds: z.int().min(0).nullish(),
  });
export type CreateVocabularyItemInput = z.infer<
  typeof createVocabularyItemSchema
>;

export const upsertVocabularyItemSchema = createVocabularyItemSchema;
export type UpsertVocabularyItemInput = z.infer<
  typeof upsertVocabularyItemSchema
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

// The picked words, as the line says them.
export const saveTranscriptPhraseSchema = createVocabularyItemSchema
  .pick({ englishInContext: true })
  .extend({ lineIndex: z.int().min(0) });
export type SaveTranscriptPhraseInput = z.infer<
  typeof saveTranscriptPhraseSchema
>;

export const saveGlossSchema = glossSchema.pick({ nativeInContext: true });
export type SaveGlossInput = z.infer<typeof saveGlossSchema>;

export const reviewVocabularyItemSchema = createVocabularyReviewSchema
  .pick({ rating: true })
  .extend({ rating: z.enum(["again", "good"]) });
export type ReviewVocabularyItemInput = z.infer<
  typeof reviewVocabularyItemSchema
>;

// ── Service result types ──

export const phraseDefinitionSchema = createVocabularyItemSchema.pick({
  englishLemma: true,
  nativeLemma: true,
});
export type PhraseDefinition = z.infer<typeof phraseDefinitionSchema>;
