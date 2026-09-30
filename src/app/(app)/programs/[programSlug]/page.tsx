import PageView from "./_components/page-view";

export default function Page({ params }: PageProps<"/programs/[programSlug]">) {
  return <PageView params={params} />;
}
