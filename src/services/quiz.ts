import { after } from "next/server";
import { cache } from "react";

import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { createMistakes } from "@/dal/mistake/mutations";
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

// Quizzes are keyed per native language and only served to onboarded users.
async function getOnboardedUser() {
  const [user, profile] = await Promise.all([
    getCurrentUserService(),
    getLearningProfileService(),
  ]);
  if (!user || !profile) return null;
  return user;
}

export const getQuizService = cache(
  async (sectionId: string): Promise<QuizWithQuestions | null> => {
    const user = await getOnboardedUser();
    if (!user) return null;
    const quiz = await getQuiz(sectionId, user.nativeLanguage);
    return quiz ?? null;
  },
);

export const getQuestionService = cache(
  async (questionId: string): Promise<Question | null> => {
    const question = await getQuestion(questionId);
    return question ?? null;
  },
);

// Will be deleted - Temporary
export async function generateQuizByAiService(
  sectionId: string,
): Promise<QuizWithQuestions> {
  const user = await getOnboardedUser();
  if (!user) throw new AppError("Unauthorized");

  const video = await getVideoService(sectionId);
  if (!video) throw new AppError("This section has no video");

  const lines = await getTranscriptService(video.id);
  if (lines.length === 0) throw new AppError("This video has no transcript");

  const { sentences } = await generateSentences({
    transcript: lines.map((line) => line.text).join("\n"),
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
    count: QUESTION_COUNT,
  });

  return db.transaction(async (tx) => {
    const quiz = await createQuiz(
      sectionId,
      { nativeLanguage: user.nativeLanguage },
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

// The answer itself is not stored (the quiz card keeps the queue), but every
// mistake found in it is, once per attempt, so a retry adds new rows. A "no"
// verdict has no mistakes and writes nothing.
export async function gradeTranslationService(
  questionId: string,
  input: GradeTranslationInput,
): Promise<TranslationGrade> {
  const user = await getOnboardedUser();
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

  if (analysis.mistakes.length > 0) {
    const { sourceSentence } = question.payload;
    const source = question.practiceId ? "practice" : "section";
    after(() =>
      createMistakes(
        user.id,
        question.id,
        analysis.mistakes.map((mistake) => ({
          ...mistake,
          source,
          sourceSentence,
          userTranslation,
        })),
      ),
    );
  }

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
