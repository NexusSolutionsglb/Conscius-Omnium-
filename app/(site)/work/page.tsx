import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedWorks } from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { getWorkIndexContent } from "@/lib/queries/pages";
import { DISCIPLINE_LABELS, type Discipline, type Work } from "@/lib/types";
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

/**
 * Match a work against a free-text query. Every token must appear somewhere in
 * the work's searchable text, so "miniature 2016" narrows rather than widens.
 */
function matchesQuery(work: Work, q: string) {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const haystack = [
    work.title,
    work.summary,
    work.medium,
    work.kind,
    work.year,
    work.client,
    work.location,
    work.role,
    work.dimensions,
    DISCIPLINE_LABELS[work.discipline],
    ...work.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string; q?: string }>;
}) {
  const { discipline, q } = await searchParams;
  const query = (q ?? "").trim();
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
  const filtered = works
    .filter((w) => (activeDiscipline ? w.discipline === activeDiscipline : true))
    .filter((w) => (query ? matchesQuery(w, query) : true));

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
        resultCount={filtered.length}
      />

      <div className="u-container pb-24 md:pb-32">
        {filtered.length ? (
          <WorkIndex works={filtered} key={`${activeDiscipline ?? "all"}-${query}`} />
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-[1.5rem] font-light text-ink">
              Nothing matches that yet.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[0.88rem] leading-relaxed text-ink-mute">
              {query
                ? `No work matches “${query}”${
                    activeDiscipline ? ` under ${DISCIPLINE_LABELS[activeDiscipline]}` : ""
                  }. Try a different word, or clear the filters.`
                : `No work under ${
                    activeDiscipline ? DISCIPLINE_LABELS[activeDiscipline] : "this filter"
                  } yet.`}
            </p>
            <Link href="/work" className="u-btn mt-8">
              Show all work
            </Link>
          </div>
        )}
      </div>

      {!activeDiscipline && !query && <CollectionsRail collections={collections} />}
    </>
  );
}
