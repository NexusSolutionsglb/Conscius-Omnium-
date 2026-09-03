import { notFound } from "next/navigation";
import { getAllCollections } from "@/lib/queries/collections";
import { PageHeader } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = (await getAllCollections()).find((c) => c.id === id);
  if (!collection) notFound();
  return (
    <>
      <PageHeader
        title={collection.title}
        description={`/work/collection/${collection.slug}`}
        back={{ href: "/admin/collections", label: "Collections" }}
      />
      <CollectionForm collection={collection} />
    </>
  );
}
