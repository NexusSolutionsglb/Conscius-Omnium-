import { PageHeader } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";

export default function NewCollectionPage() {
  return (
    <>
      <PageHeader title="New series" back={{ href: "/admin/collections", label: "Series" }} />
      <CollectionForm collection={null} />
    </>
  );
}
