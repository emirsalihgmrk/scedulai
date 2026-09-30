import { generateSentences } from "@/ai/tasks/generate-sentences";
import { getTranscriptService, getVideoService } from "@/services/video";
import {
  CreateAnswerInput,
  CreateQuestionInput,
  Question,
  QuestionWithAnswer,
  QuizWithQuestions,
  SubmitTranslationAnswerInput,
  submitTranslationAnswerSchema,
} from "@/schemas/quiz";
import {
  createQuestions,
  createQuiz,
  deleteAnswers,
  upsertAnswer,
} from "@/dal/quiz/mutations";
import { createAiTrace } from "@/dal/ai/mutations";
import { after } from "next/server";
import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { getQuestion, getQuiz } from "@/dal/quiz/queries";
import { upsertSectionProgress } from "@/dal/program/mutations";
import { getCurrentUser } from "@/services/auth";
import { getCurrentLearningProfileService } from "@/services/learning-profile";
import { AppError } from "@/lib/errors";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { QUIZ_PASS_ACCURACY, type QuizStatus } from "@/constants/progress";
import { db } from "@/db";
import { Transaction } from "@/schemas/common";
import { cache } from "react";

const QUESTION_COUNT = 5;

// Quizzes are keyed per language pair: native language lives on the user,
// target language on their learning profile.
async function getLearnerLanguages() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentLearningProfileService(),
  ]);
  if (!user || !profile) return null;
  return {
    user,
    nativeLanguage: user.nativeLanguage,
    targetLanguage: profile.targetLanguage,
  };
}

export async function submitTranslationAnswerService(
  questionId: string,
  input: SubmitTranslationAnswerInput,
): Promise<QuestionWithAnswer> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized");

  const parsedInput = submitTranslationAnswerSchema.safeParse(input);
  if (!parsedInput.success) throw new AppError("Invalid data");
  const response = parsedInput.data;

  const question = await getQuestion(questionId);
  if (!question) throw new AppError("Not found");
  if (question.payload.type !== "translation")
    throw new AppError("Invalid question type");

  const analyzeInput = {
    sentence: question.payload.sourceSentence,
    originalSentence: question.payload.expectedTranslation ?? "",
    userTranslation: response.userTranslation,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
  };

  const {
    output: analysis,
    accuracy,
    model,
    promptVersion,
    latencyMs,
    usage,
  } = await analyzeSentence(analyzeInput);

  const answerInput: CreateAnswerInput = {
    result: { type: "translation", response, analysis },
    accuracy: Math.round(accuracy),
  };

  const answer = await upsertAnswer(user.id, questionId, answerInput);

  after(async () => {
    try {
      await createAiTrace({
        task: "analyze-sentence",
        model,
        promptVersion,
        userId: user.id,
        input: analyzeInput,
        output: analysis,
        metadata: { questionId, accuracy: Math.round(accuracy) },
        latencyMs,
        inputTokens: usage.inputTokens ?? null,
        outputTokens: usage.outputTokens ?? null,
      });
    } catch (err) {
      console.error("Failed to write AI trace", err);
    }
  });

  return { ...question, answer };
}

export async function evaluateQuizService(
  sectionId: string,
): Promise<QuizStatus | null> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized");

  const quiz = await getQuizService(sectionId);
  if (!quiz) throw new AppError("Not found");

  const graded = quiz.questions.filter((q) => q.answer !== null);
  if (quiz.questions.length === 0 || graded.length < quiz.questions.length) {
    return null;
  }

  const avgAccuracy = Math.round(
    graded.reduce((sum, q) => sum + q.answer!.accuracy, 0) / graded.length,
  );
  const quizStatus: QuizStatus =
    avgAccuracy >= QUIZ_PASS_ACCURACY ? "passed" : "failed";

  await upsertSectionProgress(user.id, sectionId, { quizStatus });
  return quizStatus;
}

export async function retryQuizService(sectionId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized");

  const quiz = await getQuizService(sectionId);
  if (!quiz) throw new AppError("Not found");

  await db.transaction(async (tx) => {
    await deleteAnswers(user.id, quiz.id, tx);
    await upsertSectionProgress(
      user.id,
      sectionId,
      { quizStatus: "in_progress" },
      tx,
    );
  });
}

export const getQuizService = cache(async function getQuizService(
  sectionId: string,
): Promise<QuizWithQuestions | null> {
  const learner = await getLearnerLanguages();
  if (!learner) return null;
  const quiz = await getQuiz(
    sectionId,
    learner.nativeLanguage,
    learner.targetLanguage,
    learner.user.id,
  );
  return quiz ?? null;
});

export async function createQuizService(
  sectionId: string,
  tx?: Transaction,
): Promise<string | null> {
  const learner = await getLearnerLanguages();
  if (!learner) return null;
  const result = await createQuiz(
    sectionId,
    {
      nativeLanguage: learner.nativeLanguage,
      targetLanguage: learner.targetLanguage,
    },
    tx,
  );
  return result?.id ?? null;
}

export async function createQuestionsService(
  quizId: string,
  input: CreateQuestionInput[],
  tx?: Transaction,
): Promise<Question[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const result = await createQuestions(quizId, input, tx);
  return result ?? [];
}

export async function generateQuizByAiService(
  sectionId: string,
): Promise<QuizWithQuestions> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized");

  const video = await getVideoService(sectionId);
  if (!video) throw new AppError("There is no video");

  const lines = await getTranscriptService(video.id);
  if (lines.length === 0) throw new AppError("The video has no transcript");

  const transcript = lines.map((line) => line.text).join("\n");

  const { sentences } = await generateSentences({
    transcript,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
    count: QUESTION_COUNT,
  });
  return db.transaction(async (tx) => {
    const createdQuizId = await createQuizService(sectionId, tx);
    if (!createdQuizId) throw new AppError("Quiz could not be created");
    const questionInput: CreateQuestionInput[] = sentences.map(
      (sentence, index) => ({
        quizId: createdQuizId,
        order: index,
        type: "translation",
        payload: {
          type: "translation",
          sourceSentence: sentence.native,
          expectedTranslation: sentence.english,
        },
      }),
    );
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
}
