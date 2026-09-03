import { PageHeader } from "@/components/admin/ui";
import { ExhibitionForm } from "@/components/admin/exhibition-form";

export default function NewExhibitionPage() {
  return (
    <>
      <PageHeader title="New exhibition" back={{ href: "/admin/exhibitions", label: "Exhibitions" }} />
      <ExhibitionForm exhibition={null} />
    </>
  );
}
