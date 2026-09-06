import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getTranscriptService, getVideoService } from "@/services/video";
import {
  CreateQuestionInput,
  QuestionWithAnswer,
  QuizWithQuestions,
} from "@/schemas/quiz";
import {
  createQuestions,
  createQuiz,
  upsertAnswer,
} from "@/dal/quiz/mutations";
import { AnswerResponse, submitAnswerSchema } from "@/schemas/quiz";
import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { getQuestion, getQuiz } from "@/dal/quiz/queries";
import { getCurrentUser } from "@/services/auth";
import { AppError } from "@/lib/errors";
import {
  getNativeLanguageEnglishName,
  type SupportedNativeLanguageCode,
  type SupportedTargetLanguageCode,
} from "@/constants/language";
import { db } from "@/db";
import { Transaction } from "@/schemas/common";

const QUESTION_COUNT = 5;

// The DB enum only ever stores supported codes, but better-auth types these
// additional fields as nullable strings — narrow (and default) them here.
function userLanguages(user: {
  nativeLanguage?: string | null;
  targetLanguage?: string | null;
}) {
  return {
    nativeLanguage: (user.nativeLanguage ??
      "tr") as SupportedNativeLanguageCode,
    targetLanguage: (user.targetLanguage ??
      "en") as SupportedTargetLanguageCode,
  };
}

export async function submitAnswerService(
  questionId: string,
  input: AnswerResponse,
): Promise<QuestionWithAnswer> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized");

  const question = await getQuestion(questionId);
  if (!question) throw new AppError("Not found");

  const { nativeLanguage } = userLanguages(user);

  const aiResult = await analyzeSentence({
    sentence: question.payload.sourceSentence,
    originalSentence: question.payload.expectedTranslation ?? "",
    userTranslation: input.userTranslation,
    nativeLanguage: getNativeLanguageEnglishName(nativeLanguage),
  });

  const { accuracy, ...analysis } = aiResult;
  const analyzedInput = {
    response: input,
    analysis: analysis,
    accuracy: Math.round(accuracy),
  };

  const parsedResult = submitAnswerSchema.safeParse(analyzedInput);
  if (!parsedResult.success) throw new AppError("Invalid data");

  const answer = await upsertAnswer(user.id, questionId, parsedResult.data);

  return { ...question, answer };
}

export async function getQuizService(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const { nativeLanguage, targetLanguage } = userLanguages(user);
  const quiz = await getQuiz(
    sectionId,
    nativeLanguage,
    targetLanguage,
    user.id,
  );
  return quiz ?? null;
}

export async function createQuizService(
  sectionId: string,
  tx?: Transaction,
): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const quizInput = userLanguages(user);
  const result = await createQuiz(sectionId, quizInput, tx);
  return result?.id ?? null;
}

export async function createQuestionsService(
  quizId: string,
  input: CreateQuestionInput[],
  tx?: Transaction,
) {
  const user = await getCurrentUser();
  if (!user) return [];
  const result = await createQuestions(quizId, input, tx);
  return result ?? [];
}

export async function generateQuizByAi(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const user = await getCurrentUser();
  const { nativeLanguage } = userLanguages(user!);

  const video = await getVideoService(sectionId);
  if (!video) return null;

  const lines = await getTranscriptService(video.id);
  if (lines.length === 0) return null;

  const transcript = lines.map((line) => line.text).join("\n");

  const { sentences } = await generateSentences({
    transcript,
    nativeLanguage: getNativeLanguageEnglishName(nativeLanguage),
    count: QUESTION_COUNT,
  });
  const query = db.transaction(async (tx) => {
    const createdQuizId = await createQuizService(sectionId, tx);
    if (!createdQuizId) return null;
    const questionInput = sentences.map((sentence, index) => ({
      quizId: createdQuizId,
      order: index,
      type: "translation" as const,
      payload: {
        type: "translation" as const,
        sourceSentence: sentence.native,
        expectedTranslation: sentence.english,
      },
    }));
    const createdQuestions = await createQuestionsService(
      createdQuizId,
      questionInput,
      tx,
    );

    return {
      id: createdQuizId,
      questions: createdQuestions.map((question) => ({
        ...question,
        answer: null,
      })),
    };
  });
  const result = await query;
  return result ?? null;
}
