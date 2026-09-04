import { notFound } from "next/navigation";
import { getAllWorks } from "@/lib/queries/works";
import { getAllCollections } from "@/lib/queries/collections";
import { PageHeader } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/work-editor";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [works, collections] = await Promise.all([getAllWorks(), getAllCollections()]);
  const work = works.find((w) => w.id === id);
  if (!work) notFound();

  return (
    <>
      <PageHeader
        title={work.title}
        description={`/gallery/${work.slug}`}
        back={{ href: "/admin/works", label: "Works" }}
      />
      <WorkEditor
        work={work}
        collections={collections.map((c) => ({ slug: c.slug, title: c.title }))}
      />
    </>
  );
}
