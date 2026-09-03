import { PageHeader } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";

export default function NewCollectionPage() {
  return (
    <>
      <PageHeader title="New collection" back={{ href: "/admin/collections", label: "Collections" }} />
      <CollectionForm collection={null} />
    </>
  );
}
