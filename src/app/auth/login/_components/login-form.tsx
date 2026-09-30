"use client";

import Link from "next/link";

import EmailOtpForm from "@/components/shared/email-otp-form";

// Only same-origin paths are honoured, so `returnTo` can't be used as an open
// redirect.
function getReturnTo(): string {
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  return returnTo?.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/programs";
}

export default function LoginForm() {
  return (
    <>
      <EmailOtpForm
        submitLabel="Sign in"
        // Full reload so the server re-reads the fresh session. Accounts
        // without a learning profile are redirected to onboarding there.
        onSignedIn={() => window.location.assign(getReturnTo())}
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to ScedulAI?{" "}
        <Link
          href="/onboarding"
          className="font-medium text-primary hover:underline"
        >
          Get started
        </Link>
      </p>
    </>
  );
}
