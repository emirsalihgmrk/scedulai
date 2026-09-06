import { db } from "@/db";
import { answersTable, questionsTable, quizzesTable } from "@/db/schema";
import { getQuestion } from "@/dal/quiz/queries";
import type {
  CreateQuestionInput,
  CreateQuizInput,
  QuestionWithAnswer,
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
) {
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
) {
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
): Promise<QuestionWithAnswer> {
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

  const question = await getQuestion(questionId);
  if (!question) throw new Error("Not found");

  return { ...question, answer };
}
