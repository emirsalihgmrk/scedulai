import { Suspense } from "react";

import Header from "@/components/shared/header";
import PageView, { PageViewFallback } from "./_components/page-view";

export default function Page({
  params,
}: {
  params: Promise<{ programSlug: string; section: string }>;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-6 sm:px-6">
        <Suspense fallback={<PageViewFallback />}>
          <PageView params={params} />
        </Suspense>
      </main>
    </div>
  );
}
