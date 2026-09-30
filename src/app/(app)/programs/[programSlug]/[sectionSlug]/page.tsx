import PageView from "./_components/page-view";

export default function Page({
  params,
}: PageProps<"/programs/[programSlug]/[sectionSlug]">) {
  return <PageView params={params} />;
}
