import { and, eq } from "drizzle-orm";

import type {
  SupportedNativeLanguageCode,
  SupportedTargetLanguageCode,
} from "@/constants/language";
import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import type { Question, QuizWithQuestions } from "@/schemas/quiz";

export async function getQuiz(
  sectionId: string,
  nativeLanguage: SupportedNativeLanguageCode,
  targetLanguage: SupportedTargetLanguageCode,
): Promise<QuizWithQuestions | undefined> {
  return db.query.quizzesTable.findFirst({
    where: and(
      eq(quizzesTable.sectionId, sectionId),
      eq(quizzesTable.nativeLanguage, nativeLanguage),
      eq(quizzesTable.targetLanguage, targetLanguage),
    ),
    columns: { id: true },
    with: {
      questions: {
        columns: { createdAt: false, updatedAt: false },
        orderBy: (questions, { asc }) => asc(questions.order),
      },
    },
  });
}

export async function getQuestion(
  questionId: string,
): Promise<Question | undefined> {
  return db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
    columns: { createdAt: false, updatedAt: false },
  });
}
