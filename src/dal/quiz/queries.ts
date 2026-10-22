import { and, eq, gte } from "drizzle-orm";

import type { SupportedNativeLanguageCode } from "@/constants/language";
import { db } from "@/db";
import { gradesTable, questionsTable, quizzesTable } from "@/db/schema";
import type {
  Grade,
  GradeListItem,
  Question,
  QuizWithQuestions,
} from "@/schemas/quiz";

export async function getQuiz(
  sectionId: string,
  nativeLanguage: SupportedNativeLanguageCode,
): Promise<QuizWithQuestions | undefined> {
  return db.query.quizzesTable.findFirst({
    where: and(
      eq(quizzesTable.sectionId, sectionId),
      eq(quizzesTable.nativeLanguage, nativeLanguage),
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

export async function getGrade(
  userId: string,
  questionId: string,
): Promise<Grade | undefined> {
  return db.query.gradesTable.findFirst({
    where: and(
      eq(gradesTable.userId, userId),
      eq(gradesTable.questionId, questionId),
    ),
    columns: { id: true },
  });
}

export async function getGrades(
  userId: string,
  since: Date,
): Promise<GradeListItem[]> {
  return db.query.gradesTable.findMany({
    where: and(eq(gradesTable.userId, userId), gte(gradesTable.createdAt, since)),
    columns: {
      createdAt: true,
      source: true,
      isCorrect: true,
      isFirstAttempt: true,
    },
    with: {
      mistakes: { columns: { category: true } },
      question: {
        columns: {},
        with: {
          quiz: {
            columns: {},
            with: {
              section: {
                columns: {},
                with: { video: { columns: { cefrLevel: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: (grades, { asc }) => asc(grades.createdAt),
  });
}

export async function getGradeCount(userId: string): Promise<number> {
  return db.$count(gradesTable, eq(gradesTable.userId, userId));
}
