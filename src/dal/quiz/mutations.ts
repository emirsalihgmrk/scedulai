import { db } from "@/db";
import { questionsTable } from "@/db/schema";
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
