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
  const quiz = await db.query.quizzesTable.findFirst({
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
              answer: true,
              answerAnalysis: true,
              answerAccuracy: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) return undefined;

  return {
    id: quiz.id,
    questions: quiz.questions.map(({ answers, ...question }) => {
      const userAnswer = answers[0];
      return {
        ...question,
        answer: userAnswer?.answer ?? null,
        answerAnalysis: userAnswer?.answerAnalysis ?? null,
        answerAccuracy: userAnswer?.answerAccuracy ?? null,
      };
    }),
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
