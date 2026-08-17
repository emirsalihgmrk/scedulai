import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { questionsTable, quizzesTable } from "@/db/schema";
import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getTranscript } from "@/services/video";
import { CreateQuizInput } from "@/schemas/quiz";
import {
  AiAnalysis,
  Question,
  QuestionAnswer,
  QuizWithQuestions,
} from "@/types/quiz";

// No auth yet — placeholders until users/sessions exist (see video.ts).
const TEMP_USER_ID = process.env.TEMP_USER_ID as string;
export const NATIVE_LANGUAGE = "Turkish";
const DEFAULT_CEFR_LEVEL = "A2" as const;
const QUESTION_COUNT = 5;

export async function getQuiz(
  videoId: string,
  userId: string = TEMP_USER_ID,
): Promise<QuizWithQuestions | undefined> {
  return db.query.quizzesTable.findFirst({
    where: and(
      eq(quizzesTable.userId, userId),
      eq(quizzesTable.videoId, videoId),
    ),
    columns: { id: true, cefrLevel: true },
    with: {
      questions: {
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
  });
}

export async function updateQuestion(
  questionId: string,
  values: {
    answer: QuestionAnswer;
    aiAnalyse: AiAnalysis;
    accuracy: number;
  },
): Promise<Question> {
  const [question] = await db
    .update(questionsTable)
    .set(values)
    .where(eq(questionsTable.id, questionId))
    .returning();

  return question;
}

export async function createQuiz(input: CreateQuizInput) {
  const [quiz] = await db.insert(quizzesTable).values(input).returning({
    id: quizzesTable.id,
    cefrLevel: quizzesTable.cefrLevel,
  });

  return quiz;
}

export async function getOrCreateQuiz(
  videoId: string,
): Promise<QuizWithQuestions> {
  const existing = await getQuiz(videoId);
  if (existing) return existing;

  const lines = await getTranscript(videoId);
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
        videoId,
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
          // Learner sees the native sentence and translates it to the target
          // language (English), so this is native-to-target, not the schema default.
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
