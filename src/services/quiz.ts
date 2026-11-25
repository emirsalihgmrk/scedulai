import { after } from "next/server";
import { cache } from "react";

import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { PROGRESS_WINDOW_DAYS } from "@/constants/progress";
import type { QuestionSource } from "@/constants/question";
import { createMistakes } from "@/dal/mistake/mutations";
import { upsertSectionProgress } from "@/dal/program/mutations";
import { createGrade, createQuestions, createQuiz } from "@/dal/quiz/mutations";
import {
  getCorrectGrades,
  getGrade,
  getGradeCount,
  getGrades,
  getQuiz,
} from "@/dal/quiz/queries";
import { db } from "@/db";
import type { Transaction } from "@/db";
import { AppError } from "@/lib/errors";
import { keepLocatableGlosses } from "@/lib/utils";
import { gradeTranslationSchema } from "@/schemas/quiz";
import type {
  Grade,
  GradeListItem,
  GradeTranslationInput,
  Question,
  QuizWithQuestions,
  TranslationGrade,
} from "@/schemas/quiz";
import type { User } from "@/schemas/user";
import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";
import { getPracticeService } from "@/services/practice";
import { getSectionProgressService } from "@/services/program";
import { getTranscriptService, getVideoService } from "@/services/video";

const QUESTION_COUNT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

// Quizzes are keyed per native language, so they are only served to onboarded
// users: no profile means no language to key them by.
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

export const getGradeService = cache(
  async (questionId: string): Promise<Grade | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const grade = await getGrade(user.id, questionId);
    return grade ?? null;
  },
);

// The section quiz's questions the learner has answered correctly; the rest
// are still to be answered.
export const getCorrectGradesService = cache(
  async (sectionId: string): Promise<Grade[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    const quiz = await getQuizService(sectionId);
    if (!quiz) return [];
    return getCorrectGrades(
      user.id,
      quiz.questions.map(({ id }) => id),
    );
  },
);

// Only as far back as the progress page looks.
export const getGradesService = cache(async (): Promise<GradeListItem[]> => {
  const user = await getCurrentUserService();
  if (!user) return [];
  const since = new Date(Date.now() - PROGRESS_WINDOW_DAYS * DAY_MS);
  return getGrades(user.id, since);
});

export const getGradeCountService = cache(async (): Promise<number> => {
  const user = await getCurrentUserService();
  if (!user) return 0;
  return getGradeCount(user.id);
});

// TODO: temporary — quizzes will be generated ahead of time, not on request.
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
          glosses: keepLocatableGlosses(
            sentence.native,
            sentence.english,
            sentence.glosses,
          ),
        },
      })),
      tx,
    );

    return { id: quiz.id, questions };
  });
}

// The answer itself is not stored (the quiz card keeps the queue), but its
// verdict and every mistake found in it are, once per attempt, so a retry adds
// new rows. Whether this is the learner's first attempt is looked up while the
// model grades, so it costs no time. `onCorrect` writes in the same
// transaction as the grade, so it lands only if the grade does.
async function gradeTranslation(
  user: User,
  question: Question,
  source: QuestionSource,
  userTranslation: string,
  onCorrect?: (tx: Transaction) => Promise<void>,
): Promise<TranslationGrade> {
  if (question.payload.type !== "translation") {
    throw new AppError("Invalid question type");
  }

  const [{ output: analysis, isCorrect }, previousGrade] = await Promise.all([
    analyzeSentence({
      sentence: question.payload.sourceSentence,
      originalSentence: question.payload.expectedTranslation,
      userTranslation,
      nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
    }),
    getGradeService(question.id),
  ]);

  const { sourceSentence } = question.payload;
  after(() =>
    db.transaction(async (tx) => {
      const grade = await createGrade(
        user.id,
        question.id,
        { source, isCorrect, isFirstAttempt: !previousGrade },
        tx,
      );
      if (isCorrect) await onCorrect?.(tx);
      if (analysis.mistakes.length === 0) return;
      await createMistakes(
        user.id,
        question.id,
        grade.id,
        analysis.mistakes.map((mistake) => ({
          ...mistake,
          source,
          sourceSentence,
          userTranslation,
        })),
        tx,
      );
    }),
  );

  return { userTranslation, analysis, isCorrect };
}

// The question is looked up in the quiz the learner is served, never by id
// alone, so a quiz in another native language can't be graded. The server
// decides when the quiz is complete: a correct answer completes it once every
// other question has been answered correctly too. Only the first completion is
// recorded.
export async function gradeQuizTranslationService(
  sectionId: string,
  questionId: string,
  input: GradeTranslationInput,
): Promise<TranslationGrade> {
  const user = await getOnboardedUser();
  if (!user) throw new AppError("Unauthorized");

  const { userTranslation } = gradeTranslationSchema.parse(input);

  const [quiz, correctGrades, progress] = await Promise.all([
    getQuizService(sectionId),
    getCorrectGradesService(sectionId),
    getSectionProgressService(sectionId),
  ]);
  const question = quiz?.questions.find(({ id }) => id === questionId);
  if (!quiz || !question) throw new AppError("Not found");

  const correctIds = new Set(correctGrades.map((grade) => grade.questionId));
  const completesQuiz =
    !progress?.quizCompletedAt &&
    quiz.questions.every(({ id }) => id === question.id || correctIds.has(id));

  return gradeTranslation(
    user,
    question,
    "section",
    userTranslation,
    completesQuiz
      ? (tx) =>
          upsertSectionProgress(
            user.id,
            sectionId,
            { quizCompletedAt: new Date() },
            tx,
          )
      : undefined,
  );
}

// The question is looked up in the learner's set for today, so another
// learner's practice (or an older set) can't be graded.
export async function gradePracticeTranslationService(
  questionId: string,
  input: GradeTranslationInput,
): Promise<TranslationGrade> {
  const user = await getOnboardedUser();
  if (!user) throw new AppError("Unauthorized");

  const { userTranslation } = gradeTranslationSchema.parse(input);

  const practice = await getPracticeService();
  const question = practice?.questions.find(({ id }) => id === questionId);
  if (!question) throw new AppError("Not found");

  return gradeTranslation(user, question, "practice", userTranslation);
}
