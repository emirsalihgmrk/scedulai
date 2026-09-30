import { Suspense } from "react";

import SectionWorkspace, { SectionWorkspaceFallback } from "./section-workspace";

interface PageViewProps {
  params: Promise<{ programSlug: string; sectionSlug: string }>;
}

export default function PageView({ params }: PageViewProps) {
  return (
    <main className="px-4 py-6 sm:px-6">
      <Suspense fallback={<SectionWorkspaceFallback />}>
        <SectionWorkspace params={params} />
      </Suspense>
    </main>
  );
}
