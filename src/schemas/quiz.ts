import { answersTable, questionsTable, quizzesTable } from "@/db/schema";
import { aiAnalysisSchema } from "@/ai/outputs/analyze-sentence";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// db types

type QuizSelect = typeof quizzesTable.$inferSelect;
type QuestionSelect = typeof questionsTable.$inferSelect;
type AnswerSelect = typeof answersTable.$inferSelect;

// query types

export type Question = Omit<QuestionSelect, "createdAt" | "updatedAt">;

export type QuestionWithAnswer = Question & {
  answer: AnswerSelect["answer"] | null;
  answerAnalysis: AnswerSelect["answerAnalysis"] | null;
  answerAccuracy: AnswerSelect["answerAccuracy"] | null;
};

export type QuizWithQuestions = Pick<QuizSelect, "id"> & {
  questions: QuestionWithAnswer[];
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

export const submitAnswerSchema = createInsertSchema(answersTable).pick({
  answer: true,
  answerAnalysis: true,
  answerAccuracy: true,
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
