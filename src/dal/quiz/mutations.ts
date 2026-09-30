import { and, eq, inArray } from "drizzle-orm";

import { db  } from "@/db";
import type {Transaction} from "@/db";
import { answersTable, questionsTable, quizzesTable } from "@/db/schema";
import type {
  Answer,
  CreateQuestionInput,
  CreateQuizInput,
  Question,
  UpsertAnswerInput,
} from "@/schemas/quiz";

const questionColumns = {
  id: questionsTable.id,
  quizId: questionsTable.quizId,
  order: questionsTable.order,
  type: questionsTable.type,
  direction: questionsTable.direction,
  payload: questionsTable.payload,
};

// `undefined` when a quiz for this section and language pair already exists.
export async function createQuiz(
  sectionId: string,
  input: CreateQuizInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(quizzesTable)
    .values({ sectionId, ...input })
    .onConflictDoNothing()
    .returning({ id: quizzesTable.id });
  return row;
}

export async function createQuestions(
  quizId: string,
  input: CreateQuestionInput[],
  tx?: Transaction,
): Promise<Question[]> {
  const executor = tx ?? db;
  return executor
    .insert(questionsTable)
    .values(input.map((question) => ({ quizId, ...question })))
    .returning(questionColumns);
}

export async function upsertAnswer(
  userId: string,
  questionId: string,
  input: UpsertAnswerInput,
  tx?: Transaction,
): Promise<Answer> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(answersTable)
    .values({ userId, questionId, ...input })
    .onConflictDoUpdate({
      target: [answersTable.userId, answersTable.questionId],
      set: input,
    })
    .returning({
      result: answersTable.result,
      accuracy: answersTable.accuracy,
    });
  return row;
}

export async function deleteAnswers(
  userId: string,
  quizId: string,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .delete(answersTable)
    .where(
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
