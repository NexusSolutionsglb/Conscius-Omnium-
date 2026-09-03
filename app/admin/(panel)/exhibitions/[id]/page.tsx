import { notFound } from "next/navigation";
import { getAllExhibitions } from "@/lib/queries/exhibitions";
import { PageHeader } from "@/components/admin/ui";
import { ExhibitionForm } from "@/components/admin/exhibition-form";

export default async function EditExhibitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exhibition = (await getAllExhibitions()).find((e) => e.id === id);
  if (!exhibition) notFound();
  return (
    <>
      <PageHeader title={exhibition.title} back={{ href: "/admin/exhibitions", label: "Exhibitions" }} />
      <ExhibitionForm exhibition={exhibition} />
    </>
  );
}
