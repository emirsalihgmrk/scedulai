"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

import { signUpSchema, type SignUpInput } from "@/schemas/auth";
import { signUpUser } from "@/services/auth";
import { SUPPORTED_NATIVE_LANGUAGES } from "@/constants/language";
import { PLAN_OPTIONS } from "@/constants/plan";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthBrandPanel } from "@/app/auth/_components/auth-brand-panel";

function BrandPanel() {
  return (
    <AuthBrandPanel
      eyebrow="AI Language Tutor"
      title="Start speaking in your first session."
      description="Tell us your native language and the tutor adapts its explanations, pace and corrections to it."
      features={[
        "Unlimited voice conversations",
        "Corrections explained in your language",
        "A lesson plan that rewrites itself weekly",
      ]}
    />
  );
}

function EmailConfirmation({ email }: { email: string }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Confirm
          your address to activate your account.
        </p>
      </header>

      <Button asChild className="h-11 w-full text-sm font-semibold">
        <Link href="/auth/login">Back to sign in</Link>
      </Button>
    </div>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof signUpSchema>, unknown, SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      nativeLanguage: "tr",
      plan: "premium",
      rememberMe: false,
    },
  });

  const selectedPlan = useWatch({ control, name: "plan" });

  const onSubmit = async (values: SignUpInput) => {
    setFormError(null);
    const result = await signUpUser(values);
    if (result.ok) {
      setSignedUpEmail(values.email);
      return;
    }
    setFormError(result.error);
  };

  return (
    <>
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        {signedUpEmail ? (
          <EmailConfirmation email={signedUpEmail} />
        ) : (
          <div className="mx-auto w-full max-w-sm">
            <header className="mb-8">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Free to start. No card required.
              </p>
            </header>

            {formError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Could not create your account</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    size="lg"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  <FieldError
                    errors={errors.name ? [errors.name] : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    size="lg"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <FieldError
                    errors={errors.email ? [errors.email] : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      size="lg"
                      className="pr-9"
                      aria-invalid={!!errors.password}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-2.5 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <FieldError errors={[errors.password]} />
                  ) : (
                    <FieldDescription>At least 8 characters.</FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="nativeLanguage">
                    Native language
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="nativeLanguage"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="nativeLanguage"
                          size="lg"
                          className="w-full"
                          aria-invalid={!!errors.nativeLanguage}
                        >
                          <SelectValue placeholder="Select your language">
                            {(value) => {
                              const language = SUPPORTED_NATIVE_LANGUAGES.find(
                                (item) => item.code === value,
                              );
                              return language ? (
                                <>
                                  <span
                                    className={cn(
                                      "fi rounded-xs",
                                      `fi-${language.countryCode}`,
                                    )}
                                  />
                                  {language.nativeName}
                                </>
                              ) : null;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_NATIVE_LANGUAGES.map((language) => (
                            <SelectItem
                              key={language.code}
                              value={language.code}
                            >
                              <span
                                className={cn(
                                  "fi rounded-xs",
                                  `fi-${language.countryCode}`,
                                )}
                              />
                              {language.nativeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldDescription>
                    Explanations and corrections use this language.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Plan</FieldLabel>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup">
                    {PLAN_OPTIONS.map((option) => {
                      const isSelected = selectedPlan === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "relative flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors outline-none",
                            "has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                            isSelected
                              ? "border-primary bg-primary/3"
                              : "border-input bg-card hover:bg-muted",
                          )}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            className="sr-only"
                            {...register("plan")}
                          />
                          {isSelected && (
                            <span className="absolute top-3 right-3 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-2.5" />
                            </span>
                          )}
                          <span className="text-sm font-semibold text-foreground">
                            {option.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {option.description} · {option.price}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FieldError
                    errors={errors.plan ? [errors.plan] : undefined}
                  />
                </Field>

                <Controller
                  control={control}
                  name="rememberMe"
                  render={({ field }) => (
                    <label className="flex w-fit items-center gap-2 text-sm text-foreground select-none">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Keep me signed in
                    </label>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full text-sm font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>Create Account</>
                  )}
                </Button>
              </FieldGroup>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By creating an account you agree to our{" "}
              <a href="#" className="text-foreground hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-foreground hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </main>

      <BrandPanel />
    </>
  );
}
