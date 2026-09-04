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
import { WorkInquiryBar } from "@/components/work/work-inquiry-bar";
import { ProcessVideo } from "@/components/work/process-video";
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
  if (!work) return buildMetadata({ title: "Artwork not found", path: `/gallery/${slug}`, noIndex: true });

  return buildMetadata({
    title: work.seo?.title || work.title,
    description:
      work.seo?.description ||
      work.summary ||
      work.description[0] ||
      `${work.title} — ${DISCIPLINE_LABELS[work.discipline]} by Shivjeet Potdar.`,
    path: `/gallery/${work.slug}`,
    image: work.seo?.ogImage || work.coverImage,
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

  return (
    <LightboxProvider>
      <JsonLd data={workJsonLd(work)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
          { name: work.title, path: `/gallery/${work.slug}` },
        ])}
      />

      <article className="pb-8">
        <WorkHero work={work} />

        {/* Description */}
        {work.description.length > 0 && (
          <div className="u-container mt-16 md:mt-24">
            <div className="mb-10 h-px w-full bg-line" />
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <div className="u-prose mx-auto space-y-5 text-[1.05rem] leading-[1.8]">
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
            </div>
          </div>
        )}

        {/* Catalogue + process footer */}
        <div className="u-container mt-20 md:mt-28">
          <div className="mb-12 h-px w-full bg-line" />
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
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
                  url={absoluteUrl(`/gallery/${work.slug}`)}
                  title={`${work.title} — Shivjeet Potdar`}
                  summary={work.summary ?? undefined}
                />
              </Reveal>
            </div>

            {work.process && (
              <Reveal>
                <p className="u-eyebrow mb-5">Watch the process</p>
                <ProcessVideo process={work.process} title={work.title} />
              </Reveal>
            )}
          </div>
        </div>

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
