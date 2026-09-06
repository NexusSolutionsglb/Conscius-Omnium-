import { getAllCollections } from "@/lib/queries/collections";
import { PageHeader } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/work-editor";

export default async function NewWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  const [collections, { collection }] = await Promise.all([
    getAllCollections(),
    searchParams,
  ]);
  // Arriving from a series editor pre-files the new artwork into that series.
  const preset = collections.find((c) => c.slug === collection);

  return (
    <>
      <PageHeader
        title="New artwork"
        description={preset ? `Will be filed under ${preset.title}.` : undefined}
        back={
          preset
            ? { href: `/admin/collections/${preset.id}`, label: preset.title }
            : { href: "/admin/works", label: "Artworks" }
        }
      />
      <WorkEditor
        work={null}
        collections={collections.map((c) => ({ slug: c.slug, title: c.title }))}
        defaultCollectionSlug={preset?.slug ?? null}
      />
    </>
  );
}
