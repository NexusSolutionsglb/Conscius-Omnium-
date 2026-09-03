import type { Metadata } from "next";
import { getPublishedWorks } from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { getWorkIndexContent } from "@/lib/queries/pages";
import { DISCIPLINE_LABELS, type Discipline } from "@/lib/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { WorkIndex } from "@/components/work/work-index";
import { WorkIndexHeader } from "@/components/work/work-index-header";
import { CollectionsRail } from "@/components/home/sections";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Selected work by Shivjeet Potdar — architecture, miniatures, photography, production design, film and identity. A cross-disciplinary practice circling ruin, memory and the boundary between reality and fiction.",
  path: "/work",
});

const DISCIPLINE_ORDER: Discipline[] = [
  "architecture",
  "spatial-design",
  "experimental",
  "photography",
  "production-design",
  "film",
  "graphic",
  "art",
];

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>;
}) {
  const { discipline } = await searchParams;
  const [works, collections, content] = await Promise.all([
    getPublishedWorks(),
    getCollections(),
    getWorkIndexContent(),
  ]);

  const present = DISCIPLINE_ORDER.filter((d) => works.some((w) => w.discipline === d));
  const counts: Record<string, number> = {};
  present.forEach((d) => {
    counts[d] = works.filter((w) => w.discipline === d).length;
  });

  const activeDiscipline =
    discipline && present.includes(discipline as Discipline)
      ? (discipline as Discipline)
      : null;
  const filtered = activeDiscipline
    ? works.filter((w) => w.discipline === activeDiscipline)
    : works;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />

      <WorkIndexHeader
        serverContent={content}
        total={works.length}
        disciplines={present}
        counts={counts}
      />

      <div className="u-container pb-24 md:pb-32">
        {filtered.length ? (
          <WorkIndex works={filtered} key={activeDiscipline ?? "all"} />
        ) : (
          <p className="py-20 text-center text-ink-mute">
            No work under {activeDiscipline ? DISCIPLINE_LABELS[activeDiscipline] : "this filter"} yet.
          </p>
        )}
      </div>

      {!activeDiscipline && <CollectionsRail collections={collections} />}
    </>
  );
}
