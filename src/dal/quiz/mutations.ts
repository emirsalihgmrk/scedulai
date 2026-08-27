import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { CefrLevel } from "@/constants/cefr-level";
import type {
  Question,
  QuestionUpdate,
  QuizWithQuestions,
} from "@/schemas/quiz";
import { eq } from "drizzle-orm";

const questionColumns = {
  id: questionsTable.id,
  quizId: questionsTable.quizId,
  order: questionsTable.order,
  type: questionsTable.type,
  direction: questionsTable.direction,
  payload: questionsTable.payload,
  answer: questionsTable.answer,
  answerAnalysis: questionsTable.answerAnalysis,
  answerAccuracy: questionsTable.answerAccuracy,
};

export async function updateQuestion(
  questionId: string,
  input: QuestionUpdate,
): Promise<Question> {
  const [question] = await db
    .update(questionsTable)
    .set(input)
    .where(eq(questionsTable.id, questionId))
    .returning(questionColumns);

  return question;
}

export async function createQuiz(
  sectionId: string,
  userId: string,
  cefrLevel: CefrLevel,
  sentences: Array<{ native: string; english: string }>,
): Promise<QuizWithQuestions> {
  return db.transaction(async (tx) => {
    const [quiz] = await tx
      .insert(quizzesTable)
      .values({ userId, sectionId, cefrLevel })
      .returning({ id: quizzesTable.id, cefrLevel: quizzesTable.cefrLevel });

    const questions = await tx
      .insert(questionsTable)
      .values(
        sentences.map((sentence, index) => ({
          quizId: quiz.id,
          order: index,
          type: "translation" as const,
          direction: "native-to-target" as const,
          payload: {
            type: "translation" as const,
            sourceSentence: sentence.native,
            expectedTranslation: sentence.english,
          },
        })),
      )
      .returning(questionColumns);

    return { ...quiz, questions };
  });
}
