import { Suspense } from "react";

import PageView, { PageViewFallback } from "./_components/page-view";

export default function Page({
  params,
}: {
  params: Promise<{ programSlug: string; section: string }>;
}) {
  return (
    <main className="px-4 py-6 sm:px-6">
      <Suspense fallback={<PageViewFallback />}>
        <PageView params={params} />
      </Suspense>
    </main>
  );
}
