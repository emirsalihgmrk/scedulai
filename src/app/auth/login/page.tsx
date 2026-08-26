"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

import { signInSchema, type SignInInput } from "@/schemas/auth";
import { signInUser } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AuthBrandPanel } from "@/app/auth/_components/auth-brand-panel";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof signInSchema>, unknown, SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: SignInInput) => {
    setFormError(null);
    const result = await signInUser(values);
    if (result.ok) {
      window.location.assign("/");
      return;
    }
    setFormError(result.error);
  };

  return (
    <>
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue your streak.
            </p>
          </header>

          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Could not sign you in</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                <FieldError
                  errors={errors.password ? [errors.password] : undefined}
                />
              </Field>

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
                    Signing in...
                  </>
                ) : (
                  <>Sign in</>
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Scedulai?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <AuthBrandPanel
        eyebrow="AI Language Tutor"
        title="Pick up where your last conversation left off."
        description="Your tutor remembers the words you missed and builds tomorrow's lesson around them."
      />
    </>
  );
}
