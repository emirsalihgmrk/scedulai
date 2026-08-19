import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getTranscript, findVideo } from "@/services/video";
import {
  Question,
  QuestionAnswerUpdateInput,
  QuizCreateInput,
  QuizWithQuestions,
} from "@/types/quiz";

// No auth yet — placeholders until users/sessions exist (see video.ts).
const TEMP_USER_ID = process.env.TEMP_USER_ID as string;
export const NATIVE_LANGUAGE = "Turkish";
const DEFAULT_CEFR_LEVEL = "A2" as const;
const QUESTION_COUNT = 5;

export async function findQuiz(
  sectionId: string,
  userId: string = TEMP_USER_ID,
): Promise<QuizWithQuestions | null> {
  const quiz = await db.query.quizzesTable.findFirst({
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

  return quiz ?? null;
}

export async function findQuestion(
  questionId: string,
): Promise<Question | null> {
  const question = await db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
  });

  return question ?? null;
}

export async function updateQuestion(
  questionId: string,
  input: QuestionAnswerUpdateInput,
): Promise<Question> {
  const [question] = await db
    .update(questionsTable)
    .set(input)
    .where(eq(questionsTable.id, questionId))
    .returning();

  return question;
}

export async function createQuiz(input: QuizCreateInput) {
  const [quiz] = await db.insert(quizzesTable).values(input).returning({
    id: quizzesTable.id,
    cefrLevel: quizzesTable.cefrLevel,
  });

  return quiz;
}

export async function findOrCreateQuiz(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const existing = await findQuiz(sectionId);
  if (existing) return existing;

  const video = await findVideo(sectionId);
  if (!video) return null;

  const lines = await getTranscript(video.id);
  const transcript = lines.map((line) => line.text).join("\n");

  const { sentences } = await generateSentences({
    transcript,
    nativeLanguage: NATIVE_LANGUAGE,
    count: QUESTION_COUNT,
    cefrLevel: DEFAULT_CEFR_LEVEL,
  });

  return db.transaction(async (tx) => {
    const [quiz] = await tx
      .insert(quizzesTable)
      .values({
        userId: TEMP_USER_ID,
        sectionId,
        cefrLevel: DEFAULT_CEFR_LEVEL,
      })
      .returning({
        id: quizzesTable.id,
        cefrLevel: quizzesTable.cefrLevel,
      });

    const questions: Question[] = await tx
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
