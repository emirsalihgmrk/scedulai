import { questionsTable, quizzesTable } from "@/db/schema";
import { aiAnalysisSchema } from "@/ai/outputs/analyze-sentence";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

// db types

type QuizSelect = typeof quizzesTable.$inferSelect;
type QuestionSelect = typeof questionsTable.$inferSelect;
export type QuestionUpdate = Partial<QuestionSelect>;

// query types

export type Question = Omit<QuestionSelect, "createdAt" | "updatedAt">;

export type QuizWithQuestions = Pick<QuizSelect, "id" | "cefrLevel"> & {
  questions: Question[];
};

// column types

export type QuestionAnswerAnalysis = z.infer<typeof aiAnalysisSchema>;

export type QuestionPayload = {
  type: "translation";
  sourceSentence: string;
  expectedTranslation: string;
  hint?: string;
};

// schemas - derived types

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
