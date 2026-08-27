import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getTranscriptService, getVideoService } from "@/services/video";
import { Question, QuizWithQuestions } from "@/schemas/quiz";
import { createQuiz, updateQuestion } from "@/dal/quiz/mutations";
import {
  QuestionAnswer,
  QuestionPayload,
  submitAnswerSchema,
} from "@/schemas/quiz";
import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { getQuestion, getQuiz } from "@/dal/quiz/queries";
import { getCurrentUser } from "@/services/auth";

export const NATIVE_LANGUAGE = "Turkish";
const DEFAULT_CEFR_LEVEL = "A2" as const;
const QUESTION_COUNT = 5;

export async function getQuizBySectionIdService(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const quiz = await getQuiz(sectionId, user.id);
  if (!quiz) return null;

  return quiz;
}

export async function getQuestionByIdService(
  questionId: string,
): Promise<Question | null> {
  const question = await getQuestion(questionId);
  if (!question) return null;

  //PERMISSION
  //

  return question;
}

export async function submitAnswerService(
  questionId: string,
  questionPayload: QuestionPayload,
  input: QuestionAnswer,
): Promise<Question> {
  const question = await getQuestionByIdService(questionId);
  if (!question) throw new Error("Not found");

  //PERMISSION
  //

  const parsedAnswer = submitAnswerSchema.safeParse(input);
  if (!parsedAnswer.success) throw new Error("Invalid data");

  const aiResult = await analyzeSentence({
    sentence: questionPayload.sourceSentence,
    originalSentence: questionPayload.expectedTranslation ?? "",
    userTranslation: input.userTranslation,
    nativeLanguage: NATIVE_LANGUAGE,
  });

  const { accuracy, ...analysis } = aiResult;
  const analyzedInput = {
    answer: input,
    answerAnalysis: analysis,
    answerAccuracy: Math.round(accuracy),
  };

  const parsedResult = submitAnswerSchema.safeParse(analyzedInput);
  if (!parsedResult.success) throw new Error("Invalid data");

  const inputResult = parsedResult.data;

  return updateQuestion(questionId, inputResult);
}

export async function getOrCreateQuizService(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const existing = await getQuizBySectionIdService(sectionId);
  if (existing) return existing;

  const video = await getVideoService(sectionId);
  if (!video) return null;

  const lines = await getTranscriptService(video.id);
  const transcript = lines.map((line) => line.text).join("\n");

  const { sentences } = await generateSentences({
    transcript,
    nativeLanguage: NATIVE_LANGUAGE,
    count: QUESTION_COUNT,
    cefrLevel: DEFAULT_CEFR_LEVEL,
  });

  return createQuiz(sectionId, user.id, DEFAULT_CEFR_LEVEL, sentences);
}
