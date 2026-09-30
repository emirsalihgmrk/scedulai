"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import EmptyState from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
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