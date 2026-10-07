import { cache } from "react";

import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { upsertSectionProgress } from "@/dal/program/mutations";
import { createQuestions, createQuiz } from "@/dal/quiz/mutations";
import { getQuestion, getQuiz } from "@/dal/quiz/queries";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { gradeTranslationSchema } from "@/schemas/quiz";
import type {
  GradeTranslationInput,
  Question,
  QuizWithQuestions,
  TranslationGrade,
} from "@/schemas/quiz";
import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";
import { getTranscriptService, getVideoService } from "@/services/video";

const QUESTION_COUNT = 5;

// Quizzes are keyed per language pair: native language lives on the user,
// target language on their learning profile.
async function getLearnerLanguages() {
  const [user, profile] = await Promise.all([
    getCurrentUserService(),
    getLearningProfileService(),
  ]);
  if (!user || !profile) return null;
  return {
    user,
    nativeLanguage: user.nativeLanguage,
    targetLanguage: profile.targetLanguage,
  };
}

export const getQuizService = cache(
  async (sectionId: string): Promise<QuizWithQuestions | null> => {
    const learner = await getLearnerLanguages();
    if (!learner) return null;
    const quiz = await getQuiz(
      sectionId,
      learner.nativeLanguage,
      learner.targetLanguage,
    );
    return quiz ?? null;
  },
);

export const getQuestionService = cache(
  async (questionId: string): Promise<Question | null> => {
    const question = await getQuestion(questionId);
    return question ?? null;
  },
);

export async function generateQuizByAiService(
  sectionId: string,
): Promise<QuizWithQuestions> {
  const learner = await getLearnerLanguages();
  if (!learner) throw new AppError("Unauthorized");

  const video = await getVideoService(sectionId);
  if (!video) throw new AppError("This section has no video");

  const lines = await getTranscriptService(video.id);
  if (lines.length === 0) throw new AppError("This video has no transcript");

  const { sentences } = await generateSentences({
    transcript: lines.map((line) => line.text).join("\n"),
    nativeLanguage: getNativeLanguageEnglishName(learner.nativeLanguage),
    count: QUESTION_COUNT,
  });

  return db.transaction(async (tx) => {
    const quiz = await createQuiz(
      sectionId,
      {
        nativeLanguage: learner.nativeLanguage,
        targetLanguage: learner.targetLanguage,
      },
      tx,
    );
    if (!quiz) throw new AppError("Quiz could not be created");

    const questions = await createQuestions(
      quiz.id,
      sentences.map((sentence, index) => ({
        order: index,
        type: "translation",
        payload: {
          type: "translation",
          sourceSentence: sentence.native,
          expectedTranslation: sentence.english,
        },
      })),
      tx,
    );

    return { id: quiz.id, questions };
  });
}

// Grades without storing: the quiz card keeps the queue, so an answer only
// lives until the learner moves on.
export async function gradeTranslationService(
  questionId: string,
  input: GradeTranslationInput,
): Promise<TranslationGrade> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { userTranslation } = gradeTranslationSchema.parse(input);

  const question = await getQuestionService(questionId);
  if (!question) throw new AppError("Not found");
  if (question.payload.type !== "translation") {
    throw new AppError("Invalid question type");
  }

  const { output: analysis, isCorrect } = await analyzeSentence({
    sentence: question.payload.sourceSentence,
    originalSentence: question.payload.expectedTranslation,
    userTranslation,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
  });

  return { userTranslation, analysis, isCorrect };
}

// Trusts the client: answers are not stored, so the server can't recount them.
export async function completeQuizService(sectionId: string): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const quiz = await getQuizService(sectionId);
  if (!quiz) throw new AppError("Not found");

  await upsertSectionProgress(user.id, sectionId, {
    quizCompletedAt: new Date(),
  });
}
