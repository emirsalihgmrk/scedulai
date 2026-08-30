import { db } from "@/db";
import { answersTable, questionsTable, quizzesTable } from "@/db/schema";
import { getQuestion } from "@/dal/quiz/queries";
import type {
  AnswerInsert,
  QuestionWithAnswer,
  QuizWithQuestions,
} from "@/schemas/quiz";
import type {
  SupportedNativeLanguageCode,
  SupportedTargetLanguageCode,
} from "@/constants/language";

const questionColumns = {
  id: questionsTable.id,
  quizId: questionsTable.quizId,
  order: questionsTable.order,
  type: questionsTable.type,
  direction: questionsTable.direction,
  payload: questionsTable.payload,
};

export async function createQuiz(
  sectionId: string,
  nativeLanguage: SupportedNativeLanguageCode,
  targetLanguage: SupportedTargetLanguageCode,
  sentences: Array<{ native: string; english: string }>,
): Promise<QuizWithQuestions | null> {
  return db.transaction(async (tx) => {
    const [quiz] = await tx
      .insert(quizzesTable)
      .values({ sectionId, nativeLanguage, targetLanguage })
      .onConflictDoNothing()
      .returning({ id: quizzesTable.id });

    // A concurrent request already created the quiz for this section + language
    // pair; signal the caller to refetch instead of duplicating questions.
    if (!quiz) return null;

    const questions = await tx
      .insert(questionsTable)
      .values(
        sentences.map((sentence, index) => ({
          quizId: quiz.id,
          order: index,
          type: "translation" as const,
          payload: {
            type: "translation" as const,
            sourceSentence: sentence.native,
            expectedTranslation: sentence.english,
          },
        })),
      )
      .returning(questionColumns);

    return {
      id: quiz.id,
      questions: questions.map((question) => ({
        ...question,
        answer: null,
      })),
    };
  });
}

export async function upsertAnswer(
  input: AnswerInsert,
): Promise<QuestionWithAnswer> {
  const [answer] = await db
    .insert(answersTable)
    .values(input)
    .onConflictDoUpdate({
      target: [answersTable.userId, answersTable.questionId],
      set: {
        response: input.response,
        analysis: input.analysis,
        accuracy: input.accuracy,
      },
    })
    .returning({
      response: answersTable.response,
      analysis: answersTable.analysis,
      accuracy: answersTable.accuracy,
    });

  const question = await getQuestion(input.questionId);
  if (!question) throw new Error("Not found");

  return { ...question, answer };
}