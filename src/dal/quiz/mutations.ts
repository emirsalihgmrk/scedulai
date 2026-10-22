import { db } from "@/db";
import type { Transaction } from "@/db";
import { gradesTable, questionsTable, quizzesTable } from "@/db/schema";
import type {
  CreateGradeInput,
  CreateQuestionInput,
  CreateQuizInput,
  Question,
} from "@/schemas/quiz";

const questionColumns = {
  id: questionsTable.id,
  quizId: questionsTable.quizId,
  practiceId: questionsTable.practiceId,
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

export async function createPracticeQuestions(
  practiceId: string,
  input: CreateQuestionInput[],
  tx?: Transaction,
): Promise<Question[]> {
  const executor = tx ?? db;
  return executor
    .insert(questionsTable)
    .values(input.map((question) => ({ practiceId, ...question })))
    .returning(questionColumns);
}

export async function createGrade(
  userId: string,
  questionId: string,
  input: CreateGradeInput,
  tx?: Transaction,
): Promise<{ id: string }> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(gradesTable)
    .values({ userId, questionId, ...input })
    .returning({ id: gradesTable.id });
  return row;
}
