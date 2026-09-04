"use client";

import Link from "next/link";
import type { HomeContent, Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { homeDefaults } from "@/lib/content/defaults/home";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, TextLink } from "@/components/ui/primitives";
import { useCursor } from "@/components/site/cursor";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { newWork } from "@/lib/editor/new-entities";

/**
 * Home featured work — a deliberately asymmetric editorial sequence,
 * distinct from the /work index. Up to five works: one full-bleed, an
 * offset pair, a wide, and a held-left standard.
 */
export function FeaturedWork({
  works,
  copy = homeDefaults.featured,
}: {
  works: Work[];
  copy?: HomeContent["featured"];
}) {
  const { setCursor, reset } = useCursor();
  const editing = useEditorMode() === "edit";
  const allWorks = useEditableData<Work>("works", works);

  if (editing) {
    // `allWorks` is the full snapshot list; show the featured set but bind each
    // card to its real index in `@works` (same object refs, so indexOf works).
    const featured = allWorks.filter((w) => w.featured);
    return (
      <section className="u-container py-8 md:py-12">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>
              <EditableText bind="home.featured.eyebrow">{copy.eyebrow}</EditableText>
            </Eyebrow>
            <EditableText
              as="h2"
              bind="home.featured.heading"
              className="mt-4 font-display text-[clamp(1.6rem,1rem+2.2vw,2.8rem)] font-light"
            >
              {copy.heading}
            </EditableText>
          </div>
          <TextLink href="/work">
            <EditableText bind="home.featured.linkLabel">{copy.linkLabel}</EditableText>
          </TextLink>
        </Reveal>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <RepeatableList
            slug="work"
            path="featured"
            items={featured}
            indexOf={(w) => allWorks.indexOf(w)}
            makeItem={() => newWork({ featured: true })}
            addLabel="Add a featured work"
            addClassName="py-3 sm:col-span-2 lg:col-span-3"
            listBind="@works"
            kind="work"
            itemLabel={(w) => w.title || "Work"}
          >
            {(w, i) => (
              <article>
                <EditableImage bind={`@works.${i}.coverImage`} folder="work">
                  {w.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.coverImage}
                      alt={w.title}
                      className="aspect-[3/2] w-full rounded object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[3/2] place-items-center rounded bg-neutral-100 text-[12px] text-neutral-400">
                      Click to add a cover
                    </div>
                  )}
                </EditableImage>
                <h3 className="mt-4 font-display text-[1.4rem] font-normal text-ink">
                  <EditableText bind={`@works.${i}.title`}>{w.title}</EditableText>
                </h3>
                <p className="u-eyebrow mt-1 text-ink-mute">
                  {DISCIPLINE_LABELS[w.discipline]}
                  {" · "}
                  <EditableText bind={`@works.${i}.year`}>{w.year ?? ""}</EditableText>
                </p>
              </article>
            )}
          </RepeatableList>
        </div>
      </section>
    );
  }

  const [lead, a, b, c, d] = works;
  if (!lead) return null;

  const linkProps = {
    onPointerEnter: () => setCursor("view"),
    onPointerLeave: reset,
  };

  return (
    <section className="u-container py-8 md:py-12">
      <Reveal className="mb-14 flex items-end justify-between gap-6">
        <div>
          <Eyebrow>
            <EditableText bind="home.featured.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="home.featured.heading"
            className="mt-4 font-display text-[clamp(1.6rem,1rem+2.2vw,2.8rem)] font-light"
          >
            {copy.heading}
          </EditableText>
        </div>
        <TextLink href="/work">
          <EditableText bind="home.featured.linkLabel">{copy.linkLabel}</EditableText>
        </TextLink>
      </Reveal>

      {/* Lead — full width */}
      <Reveal>
        <Link href={`/work/${lead.slug}`} className="group block" {...linkProps}>
          <ArtImage
            src={lead.coverImage}
            alt={lead.images[0]?.alt ?? lead.title}
            ratio="16 / 10"
            fill
            sizes="(min-width:1280px) 90vw, 100vw"
            hoverZoom
            placeholder={blurFor(lead.coverImage) ? "blur" : "empty"}
            blurDataURL={blurFor(lead.coverImage)}
          />
          <Caption work={lead} className="mt-5" />
        </Link>
      </Reveal>

      {/* Offset pair */}
      {a && b && (
        <div className="mt-24 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {[a, b].map((work, i) => (
            <Reveal key={work.slug} className={i === 1 ? "md:pt-28" : undefined}>
              <Link href={`/work/${work.slug}`} className="group block" {...linkProps}>
                <ArtImage
                  src={work.coverImage}
                  alt={work.images[0]?.alt ?? work.title}
                  ratio={i === 1 ? "4 / 5" : "3 / 2"}
                  fill
                  sizes="(min-width:768px) 45vw, 100vw"
                  hoverZoom
                  placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                  blurDataURL={blurFor(work.coverImage)}
                />
                <Caption work={work} className="mt-4" />
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {/* Wide */}
      {c && (
        <Reveal className="mt-24 ml-auto w-full lg:w-[82%]">
          <Link href={`/work/${c.slug}`} className="group block" {...linkProps}>
            <ArtImage
              src={c.coverImage}
              alt={c.images[0]?.alt ?? c.title}
              ratio="2 / 1"
              fill
              sizes="(min-width:1024px) 80vw, 100vw"
              hoverZoom
              placeholder={blurFor(c.coverImage) ? "blur" : "empty"}
              blurDataURL={blurFor(c.coverImage)}
            />
            <Caption work={c} className="mt-4" align="right" />
          </Link>
        </Reveal>
      )}

      {/* Held left */}
      {d && (
        <Reveal className="mt-24 w-full lg:w-[62%]">
          <Link href={`/work/${d.slug}`} className="group block" {...linkProps}>
            <ArtImage
              src={d.coverImage}
              alt={d.images[0]?.alt ?? d.title}
              ratio="1 / 1"
              fill
              sizes="(min-width:1024px) 60vw, 100vw"
              hoverZoom
              placeholder={blurFor(d.coverImage) ? "blur" : "empty"}
              blurDataURL={blurFor(d.coverImage)}
            />
            <Caption work={d} className="mt-4" />
          </Link>
        </Reveal>
      )}
    </section>
  );
}

function Caption({
  work,
  className,
  align = "left",
}: {
  work: Work;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1",
        align === "right" && "sm:flex-row-reverse sm:text-right",
        className,
      )}
    >
      <h3 className="font-display text-[1.4rem] font-normal text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
        {work.title}
      </h3>
      <p className="u-eyebrow">
        {[DISCIPLINE_LABELS[work.discipline], work.year].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}
