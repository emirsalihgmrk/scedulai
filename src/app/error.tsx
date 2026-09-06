"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <EmptyState
          icon={TriangleAlert}
          title="Something went wrong"
          description="An unexpected error occurred. Please try again."
        />
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}