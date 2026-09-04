import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentWorks,
  getAllWorkSlugs,
  getRelatedWorks,
  getWorkBySlug,
} from "@/lib/queries/works";
import { env } from "@/lib/env";
import { AVAILABILITY_LABELS, DISCIPLINE_LABELS } from "@/lib/types";
import {
  breadcrumbJsonLd,
  buildMetadata,
  workJsonLd,
} from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { ShareBar } from "@/components/site/share-bar";
import { JsonLd } from "@/components/site/json-ld";
import { LightboxProvider } from "@/components/work/lightbox";
import { WorkHero } from "@/components/work/work-hero";
import { WorkMeta } from "@/components/work/work-meta";
import { WorkGallery } from "@/components/work/work-gallery";
import { WorkInquiryBar } from "@/components/work/work-inquiry-bar";
import { WorkNavigation } from "@/components/work/work-navigation";
import { RelatedWorks } from "@/components/work/related-works";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return buildMetadata({ title: "Work not found", path: `/work/${slug}`, noIndex: true });

  return buildMetadata({
    title: work.seo?.title || work.title,
    description:
      work.seo?.description ||
      work.summary ||
      work.description[0] ||
      `${work.title} — ${DISCIPLINE_LABELS[work.discipline]} by Shivjeet Potdar.`,
    path: `/work/${work.slug}`,
    image: work.seo?.ogImage || work.coverImage,
    // Only pass a size when we actually know it, and only for the cover — a
    // custom seo.ogImage has no stored dimensions.
    ...(work.seo?.ogImage
      ? {}
      : { imageWidth: work.images[0]?.width, imageHeight: work.images[0]?.height }),
    imageAlt: work.images[0]?.alt || work.title,
    type: "article",
    publishedTime: work.publishedAt,
    noIndex: work.status !== "published",
  });
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const [{ prev, next }, related] = await Promise.all([
    getAdjacentWorks(slug),
    getRelatedWorks(slug, 3),
  ]);

  const hasGallery = work.images.length > 1;

  return (
    <LightboxProvider>
      <JsonLd data={workJsonLd(work)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: work.title, path: `/work/${work.slug}` },
        ])}
      />

      <article className="pb-8">
        <WorkHero work={work} />

        {/* Catalogue body */}
        <div className="u-container mt-16 md:mt-24">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Text column */}
            <div className="lg:col-span-7 lg:pr-10">
              <Reveal>
                <p className="u-eyebrow">About this work</p>
                <div className="u-prose mt-5 space-y-5 text-[1rem] leading-[1.75]">
                  {work.description.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </Reveal>

              {work.statement && (
                <Reveal className="mt-12 border-l border-line-strong pl-6">
                  <p
                    className="font-display text-[1.4rem] font-light italic leading-[1.4] text-ink"
                    style={{ fontStyle: "italic" }}
                  >
                    &ldquo;{work.statement}&rdquo;
                  </p>
                  <p className="u-eyebrow mt-4">Shivjeet Potdar</p>
                </Reveal>
              )}

              {work.concept && (
                <Reveal className="mt-12">
                  <p className="u-eyebrow">Concept</p>
                  <p className="u-prose mt-4 text-[0.95rem] leading-[1.75]">{work.concept}</p>
                </Reveal>
              )}

              {work.process && (
                <Reveal className="mt-10">
                  <p className="u-eyebrow">Process</p>
                  <p className="u-prose mt-4 text-[0.95rem] leading-[1.75]">{work.process}</p>
                </Reveal>
              )}

              {work.credits && work.credits.length > 0 && (
                <Reveal className="mt-12">
                  <p className="u-eyebrow">Credits</p>
                  <dl className="mt-4 divide-y divide-line border-y border-line">
                    {work.credits.map((c, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[8rem_1fr]"
                      >
                        <dt className="u-eyebrow pt-0.5">{c.role}</dt>
                        <dd className="text-[0.88rem] text-ink-soft">{c.name}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}
            </div>

            {/* Meta + enquiry column */}
            <aside className="lg:col-span-5 lg:border-l lg:border-line lg:pl-14">
              <Reveal>
                <p className="u-eyebrow mb-5">Catalogue</p>
                <WorkMeta work={work} />
              </Reveal>
              <Reveal className="mt-10">
                <WorkInquiryBar work={work} whatsappNumber={env.whatsappNumber} />
              </Reveal>
              <Reveal className="mt-10 border-t border-line pt-8">
                <p className="u-eyebrow mb-4">Share this work</p>
                <ShareBar
                  url={absoluteUrl(`/work/${work.slug}`)}
                  title={`${work.title} — Shivjeet Potdar`}
                  summary={work.summary ?? undefined}
                />
              </Reveal>
            </aside>
          </div>
        </div>

        {/* Image sequence */}
        {hasGallery && (
          <div className="u-container mt-20 md:mt-28">
            <Reveal>
              <p className="u-eyebrow mb-10">
                {work.images.length - 1} more{" "}
                {work.images.length - 1 === 1 ? "image" : "images"}
              </p>
            </Reveal>
            <WorkGallery images={work.images} />
          </div>
        )}

        {/* Availability line */}
        <div className="u-container mt-24">
          <p className="text-center text-[0.75rem] uppercase tracking-[0.2em] text-ink-faint">
            {work.title} — {AVAILABILITY_LABELS[work.availability]}
          </p>
        </div>
      </article>

      <RelatedWorks works={related} />

      <div className="u-container">
        <WorkNavigation prev={prev} next={next} />
      </div>
    </LightboxProvider>
  );
}
