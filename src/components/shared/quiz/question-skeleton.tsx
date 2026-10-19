export default function QuestionSkeleton() {
  return (
    <div className="sticky top-20">
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-xl border border-border">
        <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-2 animate-pulse rounded-full bg-muted" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 sm:px-6">
          <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-4">
            <div className="h-2.5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
