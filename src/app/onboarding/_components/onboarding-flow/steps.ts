import type {
  SupportedNativeLanguageCode,
  SupportedTargetLanguageCode,
} from "@/constants/language";
import { SUPPORTED_TARGET_LANGUAGES } from "@/constants/language";
import type { DailyMinutes, LearningGoal } from "@/constants/learning";
import type { CompleteOnboardingInput } from "@/schemas/learning-profile";

import { UNSURE_LEVEL } from "./options";

export type StepId =
  | "nativeLanguage"
  | "targetLanguage"
  | "level"
  | "placement"
  | "goal"
  | "dailyMinutes"
  | "name"
  | "account";

export interface Draft {
  nativeLanguage: SupportedNativeLanguageCode | undefined;
  targetLanguage: SupportedTargetLanguageCode;
  level: string | undefined;
  // questionId → chosen option index; null = "I don't know".
  placementAnswers: Record<string, number | null>;
  goal: LearningGoal | undefined;
  dailyMinutes: DailyMinutes | undefined;
  name: string;
}

export interface OnboardingViewer {
  name: string;
  nativeLanguage: SupportedNativeLanguageCode;
}

export const STEP_COPY: Record<StepId, { title: string; description: string }> = {
  nativeLanguage: {
    title: "What's your native language?",
    description: "Explanations and corrections will be written in it.",
  },
  targetLanguage: {
    title: "What do you want to learn?",
    description: "You can add more languages later.",
  },
  level: {
    title: "How would you rate your level?",
    description: "A rough guess is fine — we'll adjust as you go.",
  },
  placement: {
    title: "Quick level check",
    description: "Pick the best answer. Not sure? Skip it — that's useful too.",
  },
  goal: {
    title: "What are you learning for?",
    description: "We'll pick videos and practice around it.",
  },
  dailyMinutes: {
    title: "How much time can you give it a day?",
    description: "Small and steady beats big and rare.",
  },
  name: {
    title: "What should we call you?",
    description: "Your tutor will use this name.",
  },
  account: {
    title: "Save your plan",
    description: "Enter your email and we'll send you a code. No password needed.",
  },
};

export function buildSteps(
  viewer: OnboardingViewer | null,
  draft: Draft,
): StepId[] {
  const steps: StepId[] = ["nativeLanguage"];
  if (SUPPORTED_TARGET_LANGUAGES.length > 1) steps.push("targetLanguage");
  steps.push("level");
  if (draft.level === UNSURE_LEVEL) steps.push("placement");
  steps.push("goal", "dailyMinutes");
  if (!viewer?.name) steps.push("name");
  if (!viewer) steps.push("account");
  return steps;
}

export function toInput(draft: Draft): CompleteOnboardingInput | null {
  const { nativeLanguage, level, goal, dailyMinutes } = draft;
  const name = draft.name.trim();
  if (!nativeLanguage || !level || !goal || !dailyMinutes || !name) return null;
  const isUnsure = level === UNSURE_LEVEL;
  return {
    name,
    nativeLanguage,
    targetLanguage: draft.targetLanguage,
    level: isUnsure ? null : (level as CompleteOnboardingInput["level"]),
    placementAnswers: isUnsure
      ? Object.entries(draft.placementAnswers).map(
          ([questionId, optionIndex]) => ({ questionId, optionIndex }),
        )
      : undefined,
    goal,
    dailyMinutes,
  };
}
