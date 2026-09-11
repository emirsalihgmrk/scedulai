import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { answersTable, questionsTable, quizzesTable } from "@/db/schema";
import type {
  Answer,
  CreateQuestionInput,
  CreateQuizInput,
  Question,
  SubmitAnswerInput,
} from "@/schemas/quiz";

import { Transaction } from "@/schemas/common";

const questionColumns = {
  id: questionsTable.id,
  quizId: questionsTable.quizId,
  order: questionsTable.order,
  type: questionsTable.type,
  direction: questionsTable.direction,
  payload: questionsTable.payload,
};

export async function createQuiz(
  sectionId: string,
  input: CreateQuizInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;

  const [result] = await executor
    .insert(quizzesTable)
    .values({ sectionId, ...input })
    .onConflictDoNothing()
    .returning({ id: quizzesTable.id });

  return result;
}

export async function createQuestions(
  quizId: string,
  input: CreateQuestionInput[],
  tx?: Transaction,
): Promise<Question[]> {
  const executor = tx ?? db;
  return executor
    .insert(questionsTable)
    .values(input.map((q) => ({ ...q, quizId })))
    .returning(questionColumns);
}

export async function upsertAnswer(
  userId: string,
  questionId: string,
  input: SubmitAnswerInput,
): Promise<Answer> {
  const [answer] = await db
    .insert(answersTable)
    .values({ userId, questionId, ...input })
    .onConflictDoUpdate({
      target: [answersTable.userId, answersTable.questionId],
      set: {
        response: input.response,
        analysis: input.analysis,
        accuracy: input.accuracy,
      },
    })
    .returning({
      response: answersTable.response,
      analysis: answersTable.analysis,
      accuracy: answersTable.accuracy,
    });

  return answer;
}

export async function deleteAnswers(
  userId: string,
  quizId: string,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor.delete(answersTable).where(
    and(
      eq(answersTable.userId, userId),
      inArray(
        answersTable.questionId,
        executor
          .select({ id: questionsTable.id })
          .from(questionsTable)
          .where(eq(questionsTable.quizId, quizId)),
      ),
    ),
  );
}
