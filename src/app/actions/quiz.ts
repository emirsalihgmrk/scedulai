"use server";

import { analyzeSentence } from "@/ai/tasks/analyze-sentence";
import { questionAnswerSubmitSchema } from "@/schemas/quiz";
import { getQuestion, NATIVE_LANGUAGE, updateQuestion } from "@/services/quiz";
import { Question, QuestionAnswerSubmitInput } from "@/types/quiz";

export async function submitAnswer(
  input: QuestionAnswerSubmitInput,
): Promise<Question> {
  const { questionId, answer } = questionAnswerSubmitSchema.parse(input);
  if (!questionId) throw new Error("questionId is required");

  const question = await getQuestion(questionId);
  if (!question) throw new Error(`Question ${questionId} not found`);

  // This flow only grades translation questions.
  if (
    answer.type !== "translation" ||
    question.payload.type !== "translation"
  ) {
    throw new Error("Only translation questions can be graded");
  }

  const result = await analyzeSentence({
    sentence: question.payload.sourceSentence,
    originalSentence: question.payload.expectedTranslation ?? "",
    userTranslation: answer.userTranslation,
    nativeLanguage: NATIVE_LANGUAGE,
  });

  const { accuracy, ...analysis } = result;
  return updateQuestion(questionId, {
    answer,
    answerAnalysis: analysis,
    answerAccuracy: Math.round(accuracy),
  });
}
