"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { completeOnboardingAction } from "@/actions/learning-profile";
import {
  SUPPORTED_NATIVE_LANGUAGES,
  SUPPORTED_TARGET_LANGUAGES,
  type SupportedNativeLanguageCode,
  type SupportedTargetLanguageCode,
} from "@/constants/language";
import {
  DAILY_MINUTES_OPTIONS,
  type DailyMinutes,
  type LearningGoal,
} from "@/constants/learning";
import type { CompleteOnboardingInput } from "@/schemas/learning-profile";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/logo";
import EmailOtpForm from "@/components/shared/email-otp-form";
import ChoiceList from "./choice-list";
import {
  DAILY_MINUTES_LABELS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  UNSURE_LEVEL,
} from "./options";

type StepId =
  | "nativeLanguage"
  | "targetLanguage"
  | "level"
  | "goal"
  | "dailyMinutes"
  | "name"
  | "account";

interface Draft {
  nativeLanguage: SupportedNativeLanguageCode | undefined;
  targetLanguage: SupportedTargetLanguageCode;
  level: string | undefined;
  goal: LearningGoal | undefined;
  dailyMinutes: DailyMinutes | undefined;
  name: string;
}

export interface OnboardingViewer {
  name: string;
  nativeLanguage: SupportedNativeLanguageCode;
}

interface OnboardingFlowProps {
  // null = guest: the flow ends with the email/code account step.
  viewer: OnboardingViewer | null;
}

const STEP_COPY: Record<StepId, { title: string; description: string }> = {
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

function buildSteps(viewer: OnboardingViewer | null): StepId[] {
  const steps: StepId[] = ["nativeLanguage"];
  if (SUPPORTED_TARGET_LANGUAGES.length > 1) steps.push("targetLanguage");
  steps.push("level", "goal", "dailyMinutes");
  if (!viewer?.name) steps.push("name");
  if (!viewer) steps.push("account");
  return steps;
}

function toInput(draft: Draft): CompleteOnboardingInput | null {
  const { nativeLanguage, level, goal, dailyMinutes } = draft;
  const name = draft.name.trim();
  if (!nativeLanguage || !level || !goal || !dailyMinutes || !name) return null;
  return {
    name,
    nativeLanguage,
    targetLanguage: draft.targetLanguage,
    level: level === UNSURE_LEVEL ? null : (level as CompleteOnboardingInput["level"]),
    goal,
    dailyMinutes,
  };
}

export default function OnboardingFlow({ viewer }: OnboardingFlowProps) {
  const steps = buildSteps(viewer);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    nativeLanguage: viewer?.nativeLanguage,
    targetLanguage: SUPPORTED_TARGET_LANGUAGES[0].code,
    level: undefined,
    goal: undefined,
    dailyMinutes: undefined,
    name: viewer?.name ?? "",
  });
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const step = steps[stepIndex];
  const copy = STEP_COPY[step];
  const isLastStep = stepIndex === steps.length - 1;
  const update = (patch: Partial<Draft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const canContinue = {
    nativeLanguage: !!draft.nativeLanguage,
    targetLanguage: !!draft.targetLanguage,
    level: !!draft.level,
    goal: !!draft.goal,
    dailyMinutes: !!draft.dailyMinutes,
    name: draft.name.trim().length > 0,
    account: false,
  }[step];

  const finish = async () => {
    const input = toInput(draft);
    if (!input) {
      setFinishError("Some answers are missing. Go back and check them.");
      return;
    }
    setFinishing(true);
    setFinishError(null);
    const result = await completeOnboardingAction(input);
    if (!result.ok) {
      setFinishing(false);
      setFinishError(result.error);
      return;
    }
    // Full reload so the server re-reads the fresh session and profile.
    window.location.assign("/programs");
  };

  const next = () => {
    if (isLastStep) void finish();
    else setStepIndex((index) => index + 1);
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <Logo />
        {!viewer && (
          <p className="text-sm text-muted-foreground">
            Have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </header>

      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous question"
          disabled={stepIndex === 0 || finishing}
          onClick={() => setStepIndex((index) => index - 1)}
          className={cn(stepIndex === 0 && "invisible")}
        >
          <ArrowLeft />
        </Button>
        <Progress
          value={((stepIndex + 1) / steps.length) * 100}
          aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
        />
      </div>

      <main className="flex flex-1 flex-col pt-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>

        <div className="mt-6 flex-1">
          {step === "nativeLanguage" && (
            <ChoiceList
              name="nativeLanguage"
              label={copy.title}
              columns={2}
              value={draft.nativeLanguage}
              onValueChange={(value) =>
                update({ nativeLanguage: value as SupportedNativeLanguageCode })
              }
              options={SUPPORTED_NATIVE_LANGUAGES.map((language) => ({
                value: language.code,
                title: language.nativeName,
                icon: (
                  <span
                    aria-hidden
                    className={cn("fi shrink-0 rounded-xs", `fi-${language.countryCode}`)}
                  />
                ),
              }))}
            />
          )}

          {step === "targetLanguage" && (
            <ChoiceList
              name="targetLanguage"
              label={copy.title}
              value={draft.targetLanguage}
              onValueChange={(value) =>
                update({ targetLanguage: value as SupportedTargetLanguageCode })
              }
              options={SUPPORTED_TARGET_LANGUAGES.map((language) => ({
                value: language.code,
                title: language.nativeName,
                icon: <span aria-hidden>{language.flag}</span>,
              }))}
            />
          )}

          {step === "level" && (
            <ChoiceList
              name="level"
              label={copy.title}
              value={draft.level}
              onValueChange={(value) => update({ level: value })}
              options={LEVEL_OPTIONS}
            />
          )}

          {step === "goal" && (
            <ChoiceList
              name="goal"
              label={copy.title}
              columns={2}
              value={draft.goal}
              onValueChange={(value) => update({ goal: value as LearningGoal })}
              options={GOAL_OPTIONS}
            />
          )}

          {step === "dailyMinutes" && (
            <ChoiceList
              name="dailyMinutes"
              label={copy.title}
              value={draft.dailyMinutes?.toString()}
              onValueChange={(value) =>
                update({ dailyMinutes: Number(value) as DailyMinutes })
              }
              options={DAILY_MINUTES_OPTIONS.map((minutes) => ({
                value: minutes.toString(),
                ...DAILY_MINUTES_LABELS[minutes],
              }))}
            />
          )}

          {step === "name" && (
            <form
              id="name-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (canContinue) next();
              }}
            >
              <Field>
                <FieldLabel htmlFor="name" className="sr-only">
                  Your name
                </FieldLabel>
                <Input
                  id="name"
                  autoComplete="given-name"
                  autoFocus
                  maxLength={60}
                  placeholder="Ada"
                  size="lg"
                  value={draft.name}
                  onChange={(event) => update({ name: event.target.value })}
                />
              </Field>
            </form>
          )}

          {step === "account" && (
            <EmailOtpForm
              name={draft.name.trim()}
              submitLabel="Create my plan"
              onSignedIn={finish}
            />
          )}
        </div>

        {finishError && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{finishError}</AlertDescription>
          </Alert>
        )}

        {step === "account" ? (
          finishError && (
            // Signed in but the profile write failed: retry just that part.
            <Button
              onClick={() => void finish()}
              disabled={finishing}
              className="mt-4 h-11 w-full text-sm font-semibold"
            >
              Try again
            </Button>
          )
        ) : (
          <Button
            type={step === "name" ? "submit" : "button"}
            form={step === "name" ? "name-form" : undefined}
            onClick={step === "name" ? undefined : next}
            disabled={!canContinue || finishing}
            className="mt-8 h-11 w-full text-sm font-semibold"
          >
            {finishing && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {isLastStep ? "Finish" : "Continue"}
          </Button>
        )}
      </main>
    </div>
  );
}
