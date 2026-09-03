import { getAllCollections } from "@/lib/queries/collections";
import { PageHeader } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/work-editor";

export default async function NewWorkPage() {
  const collections = await getAllCollections();
  return (
    <>
      <PageHeader
        title="New work"
        back={{ href: "/admin/works", label: "Works" }}
      />
      <WorkEditor
        work={null}
        collections={collections.map((c) => ({ slug: c.slug, title: c.title }))}
      />
    </>
  );
}
