import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Question, QuizWithQuestions } from "@/schemas/quiz";
import type {
  SupportedNativeLanguageCode,
  SupportedTargetLanguageCode,
} from "@/constants/language";

export async function getQuiz(
  sectionId: string,
  nativeLanguage: SupportedNativeLanguageCode,
  targetLanguage: SupportedTargetLanguageCode,
  userId: string,
): Promise<QuizWithQuestions | undefined> {
  const row = await db.query.quizzesTable.findFirst({
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
        with: {
          answers: {
            where: (answers, { eq }) => eq(answers.userId, userId),
            columns: {
              response: true,
              analysis: true,
              accuracy: true,
            },
          },
        },
      },
    },
  });

  if (!row) return undefined;

  return {
    id: row.id,
    questions: row.questions.map(({ answers, ...question }) => ({
      ...question,
      answer: answers[0] ?? null,
    })),
  };
}

export async function getQuestion(
  questionId: string,
): Promise<Question | undefined> {
  return db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
    columns: { createdAt: false, updatedAt: false },
  });
}
