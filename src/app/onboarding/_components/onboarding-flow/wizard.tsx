"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { completeOnboardingAction } from "@/actions/learning-profile";
import Logo from "@/components/shared/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SUPPORTED_TARGET_LANGUAGES } from "@/constants/language";
import { cn } from "@/lib/utils";

import StepField from "./step-field";
import {
  buildSteps,
  STEP_COPY,
  toInput
  
  
} from "./steps";
import type {Draft, OnboardingViewer} from "./steps";

interface WizardProps {
  // null = guest: the flow ends with the email/code account step.
  viewer: OnboardingViewer | null;
}

export default function Wizard({ viewer }: WizardProps) {
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
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const step = steps[stepIndex];
  const copy = STEP_COPY[step];
  const isLastStep = stepIndex === steps.length - 1;
  const updateDraft = (patch: Partial<Draft>) =>
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

  const handleFinish = async () => {
    const input = toInput(draft);
    if (!input) {
      setFinishError("Some answers are missing. Go back and check them.");
      return;
    }
    setIsFinishing(true);
    setFinishError(null);
    const result = await completeOnboardingAction(input);
    if (!result.ok) {
      setIsFinishing(false);
      setFinishError(result.error);
      return;
    }
    // Full reload so the server re-reads the fresh session and profile.
    window.location.assign("/programs");
  };

  const handleContinue = () => {
    if (isLastStep) void handleFinish();
    else setStepIndex((index) => index + 1);
  };

  return (
    <div className="flex flex-1 flex-col">
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
          disabled={stepIndex === 0 || isFinishing}
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

      <section className="flex flex-1 flex-col pt-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>

        <div className="mt-6 flex-1">
          <StepField
            step={step}
            label={copy.title}
            draft={draft}
            onDraftChange={updateDraft}
            onNameSubmit={() => {
              if (canContinue) handleContinue();
            }}
            onSignedIn={handleFinish}
          />
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
              onClick={() => void handleFinish()}
              disabled={isFinishing}
              className="mt-4 h-11 w-full text-sm font-semibold"
            >
              Try again
            </Button>
          )
        ) : (
          <Button
            type={step === "name" ? "submit" : "button"}
            form={step === "name" ? "name-form" : undefined}
            onClick={step === "name" ? undefined : handleContinue}
            disabled={!canContinue || isFinishing}
            className="mt-8 h-11 w-full text-sm font-semibold"
          >
            {isFinishing && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {isLastStep ? "Finish" : "Continue"}
          </Button>
        )}
      </section>
    </div>
  );
}
