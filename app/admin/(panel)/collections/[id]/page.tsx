import { notFound } from "next/navigation";
import { getAllCollections } from "@/lib/queries/collections";
import { getAllWorks } from "@/lib/queries/works";
import { PageHeader } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";
import { SeriesArtworks } from "@/components/admin/series-artworks";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collections, works] = await Promise.all([
    getAllCollections(),
    getAllWorks(),
  ]);
  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();

  const inSeries = works
    .filter((w) => w.collectionSlug === collection.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const available = works.filter((w) => w.collectionSlug !== collection.slug);

  return (
    <>
      <PageHeader
        title={collection.title}
        description={`/gallery/collection/${collection.slug}`}
        back={{ href: "/admin/collections", label: "Series" }}
      />
      <div className="space-y-6">
        <CollectionForm collection={collection} />
        <SeriesArtworks
          collectionSlug={collection.slug}
          works={inSeries}
          available={available}
        />
      </div>
    </>
  );
}
