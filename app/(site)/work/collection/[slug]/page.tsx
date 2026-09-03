import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCollectionBySlug,
  getCollectionSlugs,
} from "@/lib/queries/collections";
import { getWorksByCollection } from "@/lib/queries/works";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { WorkIndex } from "@/components/work/work-index";
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
  const collection = await getCollectionBySlug(slug);
  if (!collection)
    return buildMetadata({ title: "Series not found", path: `/work/collection/${slug}`, noIndex: true });
  return buildMetadata({
    title: collection.title,
    description: collection.description,
    path: `/work/collection/${collection.slug}`,
    image: collection.coverImage,
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const works = await getWorksByCollection(slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: collection.title, path: `/work/collection/${collection.slug}` },
        ])}
      />

      <header className="u-container pb-14 pt-36 md:pb-20 md:pt-44">
        <Eyebrow>
          <Link href="/work" className="transition-colors hover:text-ink">
            Work
          </Link>
          <span className="mx-2 text-ink-faint">/</span>Series
        </Eyebrow>
        <TextReveal
          as="h1"
          text={collection.title}
          className="mt-5 font-display text-[clamp(2.4rem,1.4rem+4vw,5rem)] font-light leading-[1.02]"
        />
        <Reveal delay={0.1} className="mt-7 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">
          <p>{collection.description}</p>
        </Reveal>
        {collection.period && (
          <Reveal delay={0.15}>
            <p className="u-eyebrow mt-6">{collection.period}</p>
          </Reveal>
        )}
      </header>

      <div className="u-container pb-28 md:pb-36">
        {works.length ? (
          <WorkIndex works={works} />
        ) : (
          <p className="py-20 text-center text-ink-mute">No published work in this series yet.</p>
        )}
      </div>
    </>
  );
}
