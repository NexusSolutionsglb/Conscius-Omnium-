import type { Metadata } from "next";
import { getSeriesWithWorks, getUnassignedWorks } from "@/lib/queries/collections";
import { getPublishedWorks } from "@/lib/queries/works";
import { getWorkIndexContent } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { WorkIndexHeader } from "@/components/work/work-index-header";
import { SeriesGallery } from "@/components/work/series-gallery";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "The gallery of Shivjeet Potdar — paintings gathered into series: Black Canvas, Duality, States of Attention and States of Awareness.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const [series, unassigned, works, content] = await Promise.all([
    getSeriesWithWorks(),
    getUnassignedWorks(),
    getPublishedWorks(),
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

      {/* Double the breathing room the gallery used to sit in — the wall
          needs the wall around it. */}
      <div className="u-container pb-48 pt-8 md:pb-64 md:pt-16">
        {series.length || unassigned.length ? (
          <SeriesGallery series={series} unassigned={unassigned} />
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-[1.5rem] text-ink">Nothing here yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
