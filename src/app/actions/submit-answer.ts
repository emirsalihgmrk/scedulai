"use server";

import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { submitAnswerSchema, SubmitAnswerInput } from "@/schemas/quiz";
import {
  getQuestion,
  NATIVE_LANGUAGE,
  updateQuestion,
} from "@/services/quiz";
import { Question } from "@/types/quiz";

export async function submitAnswer(
  input: SubmitAnswerInput,
): Promise<Question> {
  const { questionId, answer } = submitAnswerSchema.parse(input);
  if (!questionId) throw new Error("questionId is required");

  const question = await getQuestion(questionId);
  if (!question) throw new Error(`Question ${questionId} not found`);

  // This flow only grades translation questions.
  if (answer.type !== "translation" || question.payload.type !== "translation") {
    throw new Error("Only translation questions can be graded");
  }

  const result = await analyzeSentence({
    sentence: question.payload.sourceSentence,
    originalSentence: question.payload.expectedTranslation ?? "",
    userTranslation: answer.userTranslation,
    nativeLanguage: NATIVE_LANGUAGE,
  });

  return updateQuestion(questionId, {
    answer,
    aiAnalyse: {
      analyse: result.analysis,
      mistakes: result.mistakes,
      alternativeAnswers: result.alternatives,
      expressions: result.expressions,
    },
    accuracy: Math.round(result.accuracy),
  });
}
