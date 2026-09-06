import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCollectionSlugs,
  getSeriesBySlug,
} from "@/lib/queries/collections";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { SeriesView } from "@/components/work/series-view";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series)
    return buildMetadata({
      title: "Series not found",
      path: `/gallery/collection/${slug}`,
      noIndex: true,
    });
  return buildMetadata({
    title: series.title,
    description: series.description,
    path: `/gallery/collection/${series.slug}`,
    image: series.plateImage ?? undefined,
  });
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
          { name: series.title, path: `/gallery/collection/${series.slug}` },
        ])}
      />

      <header className="u-container pb-16 pt-36 md:pb-24 md:pt-44">
        <Eyebrow>
          <Link href="/gallery" className="transition-colors hover:text-ink">
            Gallery
          </Link>
          <span className="mx-2 text-ink-faint">/</span>Series
        </Eyebrow>
        <TextReveal
          as="h1"
          text={series.title}
          className="mt-5 font-display text-[clamp(2.2rem,1.4rem+3.4vw,4.4rem)] leading-[1.06]"
        />
        {series.description && (
          <Reveal
            delay={0.1}
            className="mt-7 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft"
          >
            <p>{series.description}</p>
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <p className="u-eyebrow mt-7">
            {series.works.length}{" "}
            {series.works.length === 1 ? "work" : "works"}
            {series.period ? ` · ${series.period}` : ""}
          </p>
        </Reveal>
      </header>

      {/* The hang itself, held in the same doubled spacing as /gallery. */}
      <div className="u-container pb-48 md:pb-64">
        <SeriesView series={series} />
      </div>
    </>
  );
}
