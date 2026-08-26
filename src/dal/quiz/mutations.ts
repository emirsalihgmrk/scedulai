import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { CefrLevel } from "@/constants/cefr-level";
import { QuestionUpdate } from "@/schemas/quiz";
import { eq } from "drizzle-orm";

export async function updateQuestion(
  questionId: string,
  input: QuestionUpdate,
) {
  const [question] = await db
    .update(questionsTable)
    .set(input)
    .where(eq(questionsTable.id, questionId))
    .returning();

  return question;
}

export async function createQuiz(
  sectionId: string,
  userId: string,
  cefrLevel: CefrLevel,
  sentences: Array<{ native: string; english: string }>,
) {
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
      .returning();

    return { ...quiz, questions };
  });
}
