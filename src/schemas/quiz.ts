import { answersTable, questionsTable, quizzesTable } from "@/db/schema";
import { aiAnalysisSchema } from "@/ai/outputs/analyze-sentence";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// db types

type QuizSelect = typeof quizzesTable.$inferSelect;
type QuestionSelect = typeof questionsTable.$inferSelect;
type AnswerSelect = typeof answersTable.$inferSelect;
export type AnswerInsert = typeof answersTable.$inferInsert;

// query types

export type Question = Omit<QuestionSelect, "createdAt" | "updatedAt">;

export type QuestionWithAnswer = Question & {
  answer: Pick<AnswerSelect, "response" | "analysis" | "accuracy"> | null;
};

export type QuizWithQuestions = Pick<QuizSelect, "id"> & {
  questions: QuestionWithAnswer[];
};

// column types

export type AnswerAnalysis = z.infer<typeof aiAnalysisSchema>;

export type QuestionPayload = {
  type: "translation";
  sourceSentence: string;
  expectedTranslation: string;
  hint?: string;
};

// schemas - derived types

export const answerResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("translation"),
    userTranslation: z.string().min(1),
  }),
]);

export type AnswerResponse = z.infer<typeof answerResponseSchema>;

export const submitAnswerSchema = createInsertSchema(answersTable).pick({
  response: true,
  analysis: true,
  accuracy: true,
});
