import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Question, QuizWithQuestions } from "@/schemas/quiz";

export async function getQuiz(
  sectionId: string,
  userId: string,
): Promise<QuizWithQuestions | undefined> {
  return db.query.quizzesTable.findFirst({
    where: and(
      eq(quizzesTable.userId, userId),
      eq(quizzesTable.sectionId, sectionId),
    ),
    columns: { id: true, cefrLevel: true },
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
