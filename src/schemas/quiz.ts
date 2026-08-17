import { createInsertSchema } from "drizzle-zod";
import { questionsTable, quizzesTable } from "@/db/schema";
import { z } from "zod";

export const createQuizSchema = createInsertSchema(quizzesTable).pick({
  userId: true,
  videoId: true,
  cefrLevel: true,
});

export const submitAnswerSchema = z.object({
  questionId: createInsertSchema(questionsTable).shape.id,
  answer: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("translation"),
      userTranslation: z.string().min(1),
    }),
    z.object({
      type: z.literal("fill-in-the-blank"),
      selectedWord: z.string().min(1),
    }),
  ]),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;