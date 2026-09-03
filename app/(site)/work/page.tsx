import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedWorks } from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";
import { DISCIPLINE_LABELS, type Discipline } from "@/lib/types";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { WorkIndex } from "@/components/work/work-index";
import { WorkFilter } from "@/components/work/work-filter";
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
  const [works, collections] = await Promise.all([
    getPublishedWorks(),
    getCollections(),
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

      <header className="u-container pb-14 pt-36 md:pb-20 md:pt-44">
        <Eyebrow>Conscious Omnium</Eyebrow>
        <TextReveal
          as="h1"
          text={"Selected\nWork"}
          className="mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,6rem)] font-light leading-[0.98]"
        />
        <Reveal delay={0.1} className="mt-8 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
          <p>
            A practice that moves between built space, the photographed miniature,
            the render and the screen — {works.length} works, none of them forced
            to be the same kind of thing.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10">
          <Suspense fallback={<div className="h-6" />}>
            <WorkFilter disciplines={present} total={works.length} counts={counts} />
          </Suspense>
        </Reveal>
      </header>

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
