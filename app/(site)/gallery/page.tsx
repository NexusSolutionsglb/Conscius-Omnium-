import type { Metadata } from "next";
import { getPublishedWorks } from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { getWorkIndexContent } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { WorkIndexHeader } from "@/components/work/work-index-header";
import { ArtGallery } from "@/components/work/art-gallery";
import { CollectionsRail } from "@/components/home/sections";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "The gallery of Shivjeet Potdar — paintings from Black Canvas, Duality, States of Attention and States of Awareness.",
  path: "/gallery",
});

export default async function WorkPage() {
  const [works, collections, content] = await Promise.all([
    getPublishedWorks(),
    getCollections(),
    getWorkIndexContent(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />

      <WorkIndexHeader serverContent={content} total={works.length} />

      <div className="u-container pb-24 md:pb-32">
        {works.length ? (
          <ArtGallery works={works} />
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-[1.5rem] font-light text-ink">
              Nothing here yet.
            </p>
          </div>
        )}
      </div>

      <CollectionsRail collections={collections} />
    </>
  );
}
