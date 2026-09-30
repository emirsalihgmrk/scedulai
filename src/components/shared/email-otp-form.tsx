"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  sendOtpSchema,
  verifyOtpSchema
  
  
} from "@/schemas/auth";
import type {SendOtpInput, VerifyOtpInput} from "@/schemas/auth";

interface EmailOtpFormProps {
  // Display name for accounts created by this sign-in (ignored for existing
  // accounts).
  name?: string;
  emailLabel?: string;
  submitLabel?: string;
  onSignedIn: () => Promise<void> | void;
}

// Passwordless sign-in: email → 6-digit code. Unknown emails are registered on
// the first successful code. Calls go through authClient (not a server action)
// so better-auth's /api/auth rate limits apply.
export default function EmailOtpForm({
  name,
  emailLabel = "Email",
  submitLabel = "Continue",
  onSignedIn,
}: EmailOtpFormProps) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const emailForm = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", otp: "" },
  });

  const handleSendCode = async ({ email }: SendOtpInput) => {
    setFormError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    if (error) {
      setFormError(error.message ?? "Could not send the code. Try again.");
      return;
    }
    codeForm.reset({ email, otp: "" });
    setSentTo(email);
  };

  const handleVerifyCode = async ({ email, otp }: VerifyOtpInput) => {
    setFormError(null);
    const { error } = await authClient.signIn.emailOtp({ email, otp, name });
    if (error) {
      setFormError(error.message ?? "That code didn't work. Try again.");
      return;
    }
    await onSignedIn();
  };

  const errorAlert = formError && (
    <Alert variant="destructive">
      <AlertDescription>{formError}</AlertDescription>
    </Alert>
  );

  if (!sentTo) {
    const { errors, isSubmitting } = emailForm.formState;
    return (
      <form onSubmit={emailForm.handleSubmit(handleSendCode)} noValidate>
        <FieldGroup>
          {errorAlert}
          <Field>
            <FieldLabel htmlFor="email">{emailLabel}</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              size="lg"
              aria-invalid={!!errors.email}
              {...emailForm.register("email")}
            />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full text-sm font-semibold"
          >
            {isSubmitting && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            Send code
          </Button>
        </FieldGroup>
      </form>
    );
  }

  const { errors, isSubmitting } = codeForm.formState;
  return (
    <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} noValidate>
      <FieldGroup>
        {errorAlert}
        <Field>
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder="000000"
            size="lg"
            className="font-mono text-lg tracking-[0.5em]"
            aria-invalid={!!errors.otp}
            {...codeForm.register("otp")}
          />
          {errors.otp ? (
            <FieldError errors={[errors.otp]} />
          ) : (
            <FieldDescription>
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{sentTo}</span>. It
              expires in 10 minutes.
            </FieldDescription>
          )}
        </Field>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full text-sm font-semibold"
        >
          {isSubmitting && (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          )}
          {submitLabel}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setSentTo(null);
            }}
            className="inline-flex items-center gap-1 rounded-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-3.5" />
            Change email
          </button>
          <button
            type="button"
            disabled={isResending}
            onClick={async () => {
              setIsResending(true);
              await handleSendCode({ email: sentTo });
              setIsResending(false);
            }}
            className="rounded-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            Resend code
          </button>
        </div>
      </FieldGroup>
    </form>
  );
}
