import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUserService } from "@/services/auth";

import SignOutButton from "./sign-out-button";

export default async function UserInfo() {
  const user = await getCurrentUserService();

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Build a plan around your level and goals, or sign in to pick up where
          you left off.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/onboarding">Get started</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{user.name}</span>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </div>
      <SignOutButton />
    </div>
  );
}

export function UserInfoFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
