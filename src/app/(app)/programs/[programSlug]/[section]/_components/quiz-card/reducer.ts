import { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";

export type QuizState = {
  quiz: QuizWithQuestions | null;
  step: number; // 0 = overview, 1..n = question
  answers: Record<string, string>; // draft input text per question
  error: string | null;
  isResetting: boolean;
};

export type QuizAction =
  | { type: "generated"; quiz: QuizWithQuestions }
  | { type: "failed"; error: string }
  | { type: "answerChanged"; questionId: string; value: string }
  | { type: "graded"; question: QuestionWithAnswer }
  | { type: "navigate"; step: number }
  | { type: "retryStarted" }
  | { type: "retrySettled"; error?: string };

export function createInitialState(quiz: QuizWithQuestions | null): QuizState {
  return { quiz, step: 0, answers: {}, error: null, isResetting: false };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "generated":
      return { ...state, quiz: action.quiz, error: null };
    case "failed":
      return { ...state, error: action.error };
    case "answerChanged":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case "graded":
      // Replace the question in place instead of a separate overlay → single source of truth.
      return state.quiz
        ? {
            ...state,
            quiz: {
              ...state.quiz,
              questions: state.quiz.questions.map((q) =>
                q.id === action.question.id ? action.question : q,
              ),
            },
          }
        : state;
    case "navigate":
      return { ...state, step: action.step };
    case "retryStarted":
      return {
        ...state,
        step: 0,
        answers: {},
        error: null,
        isResetting: true,
        quiz: state.quiz
          ? {
              ...state.quiz,
              questions: state.quiz.questions.map((q) => ({
                ...q,
                answer: null,
              })),
            }
          : state.quiz,
      };
    case "retrySettled":
      return {
        ...state,
        isResetting: false,
        error: action.error ?? state.error,
      };
    default:
      return state;
  }
}
