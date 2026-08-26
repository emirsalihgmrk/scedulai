import { questionsTable } from "@/db/schema";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export type QuestionUpdate = Partial<typeof questionsTable.$inferSelect>;

export const questionPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("translation"),
    sourceSentence: z.string(),
    expectedTranslation: z.string(),
    hint: z.string().optional(),
  }),
]);

export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

export const questionAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("translation"),
    userTranslation: z.string().min(1),
  }),
]);

export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;

export const submitAnswerSchema = createUpdateSchema(questionsTable).pick({
  answer: true,
  answerAnalysis: true,
  answerAccuracy: true,
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
