"use client";

import Link from "next/link";

import EmailOtpForm from "@/components/shared/email-otp-form";
import { AuthBrandPanel } from "@/app/auth/_components/auth-brand-panel";

// Only same-origin paths are honoured, so `returnTo` can't be used as an open
// redirect.
function getReturnTo(): string {
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  return returnTo?.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/programs";
}

export function LoginPanel() {
  return (
    <>
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with a one-time code sent to your email.
            </p>
          </header>

          <EmailOtpForm
            submitLabel="Sign in"
            // Full reload so the server re-reads the fresh session. Accounts
            // without a learning profile are redirected to onboarding there.
            onSignedIn={() => window.location.assign(getReturnTo())}
          />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Scedulai?{" "}
            <Link
              href="/onboarding"
              className="font-medium text-primary hover:underline"
            >
              Get started
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
