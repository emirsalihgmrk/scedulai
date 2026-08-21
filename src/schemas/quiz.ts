import { createInsertSchema } from "drizzle-zod";
import { questionsTable, quizzesTable } from "@/db/schema";
import { z } from "zod";

// quiz schemas

export const quizCreateSchema = createInsertSchema(quizzesTable).pick({
  userId: true,
  sectionId: true,
  cefrLevel: true,
});

// question schemas

export const questionTranslationPayloadSchema = z.object({
  type: z.literal("translation"),
  sourceSentence: z.string(),
  expectedTranslation: z.string(),
  hint: z.string().optional(),
});

export const questionFillInTheBlankPayloadSchema = z.object({
  type: z.literal("fill-in-the-blank"),
  sentenceWithBlank: z.string(),
  missingWord: z.string(),
  options: z.array(z.string()).optional(),
});

export const questionPayloadSchema = z.discriminatedUnion("type", [
  questionTranslationPayloadSchema,
  questionFillInTheBlankPayloadSchema,
]);

export const questionTranslationAnswerSchema = z.object({
  type: z.literal("translation"),
  userTranslation: z.string().min(1),
});

export const questionFillInTheBlankAnswerSchema = z.object({
  type: z.literal("fill-in-the-blank"),
  selectedWord: z.string().min(1),
});

export const questionAnswerSchema = z.discriminatedUnion("type", [
  questionTranslationAnswerSchema,
  questionFillInTheBlankAnswerSchema,
]);

export const questionAnswerSubmitSchema = z.object({
  questionId: createInsertSchema(questionsTable).shape.id,
  answer: questionAnswerSchema,
});
