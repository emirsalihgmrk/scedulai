"use client";

import EmailOtpForm from "@/components/shared/email-otp-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  SUPPORTED_NATIVE_LANGUAGES,
  SUPPORTED_TARGET_LANGUAGES
  
  
} from "@/constants/language";
import type {SupportedNativeLanguageCode, SupportedTargetLanguageCode} from "@/constants/language";
import {
  DAILY_MINUTES_OPTIONS
  
  
} from "@/constants/learning";
import type {DailyMinutes, LearningGoal} from "@/constants/learning";
import { cn } from "@/lib/utils";

import ChoiceList from "./choice-list";
import { DAILY_MINUTES_LABELS, GOAL_OPTIONS, LEVEL_OPTIONS } from "./options";
import PlacementTest from "./placement-test";
import type { Draft, StepId } from "./steps";

interface StepFieldProps {
  step: StepId;
  label: string;
  draft: Draft;
  onDraftChange: (patch: Partial<Draft>) => void;
  onNameSubmit: () => void;
  onSignedIn: () => Promise<void>;
}

// The answer control for one onboarding step.
export default function StepField({
  step,
  label,
  draft,
  onDraftChange,
  onNameSubmit,
  onSignedIn,
}: StepFieldProps) {
  return (
    <div className="mt-6 flex-1">
      {step === "nativeLanguage" && (
        <ChoiceList
          name="nativeLanguage"
          label={label}
          columns={2}
          value={draft.nativeLanguage}
          onValueChange={(value) =>
            onDraftChange({ nativeLanguage: value as SupportedNativeLanguageCode })
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
          label={label}
          value={draft.targetLanguage}
          onValueChange={(value) =>
            onDraftChange({ targetLanguage: value as SupportedTargetLanguageCode })
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
          label={label}
          value={draft.level}
          onValueChange={(value) => onDraftChange({ level: value })}
          options={LEVEL_OPTIONS}
        />
      )}

      {step === "placement" && (
        <PlacementTest
          targetLanguage={draft.targetLanguage}
          answers={draft.placementAnswers}
          onAnswersChange={(placementAnswers) =>
            onDraftChange({ placementAnswers })
          }
        />
      )}

      {step === "goal" && (
        <ChoiceList
          name="goal"
          label={label}
          columns={2}
          value={draft.goal}
          onValueChange={(value) => onDraftChange({ goal: value as LearningGoal })}
          options={GOAL_OPTIONS}
        />
      )}

      {step === "dailyMinutes" && (
        <ChoiceList
          name="dailyMinutes"
          label={label}
          value={draft.dailyMinutes?.toString()}
          onValueChange={(value) =>
            onDraftChange({ dailyMinutes: Number(value) as DailyMinutes })
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
            onNameSubmit();
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
              onChange={(event) => onDraftChange({ name: event.target.value })}
            />
          </Field>
        </form>
      )}

      {step === "account" && (
        <EmailOtpForm
          name={draft.name.trim()}
          submitLabel="Create my plan"
          onSignedIn={onSignedIn}
        />
      )}
    </div>
  );
}
