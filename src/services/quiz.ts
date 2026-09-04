import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getTranscriptService, getVideoService } from "@/services/video";
import { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";
import { createQuiz, upsertAnswer } from "@/dal/quiz/mutations";
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

  return upsertAnswer(user.id, questionId, parsedResult.data);
}

export async function getOrCreateQuizService(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { nativeLanguage, targetLanguage } = userLanguages(user);

  const existing = await getQuiz(
    sectionId,
    nativeLanguage,
    targetLanguage,
    user.id,
  );
  if (existing) return existing;

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

  const created = await createQuiz(
    sectionId,
    nativeLanguage,
    targetLanguage,
    sentences,
  );
  if (created) return created;

  // A concurrent request created the quiz first — return the shared one.
  return (
    (await getQuiz(sectionId, nativeLanguage, targetLanguage, user.id)) ?? null
  );
}
