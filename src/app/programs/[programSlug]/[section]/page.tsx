import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "@/components/shared/header";
import PageView, { PageViewFallback } from "./_components/page-view";

function parseOrder(section: string): number | null {
  const match = /^section-(\d+)$/.exec(section);
  if (!match) return null;
  return Number(match[1]);
}

export default async function Page({
  params,
}: {
  params: Promise<{ programSlug: string; section: string }>;
}) {
  const { programSlug, section } = await params;

  const sectionOrder = parseOrder(section);
  if (sectionOrder === null) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-6 sm:px-6">
        <Suspense fallback={<PageViewFallback />}>
          <PageView sectionOrder={sectionOrder} programSlug={programSlug} />
        </Suspense>
      </main>
    </div>
  );
}
