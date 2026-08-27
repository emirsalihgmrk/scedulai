import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getQuiz(sectionId: string, userId: string) {
  return db.query.quizzesTable.findFirst({
    where: and(
      eq(quizzesTable.userId, userId),
      eq(quizzesTable.sectionId, sectionId),
    ),
    columns: { id: true, cefrLevel: true },
    with: {
      questions: {
        orderBy: (questions, { asc }) => asc(questions.order),
      },
    },
  });
}

export async function getQuestion(questionId: string) {
  return db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
  });
}
