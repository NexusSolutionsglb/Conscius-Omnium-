"use client";

import Link from "next/link";
import type { HomeContent, Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { homeDefaults } from "@/lib/content/defaults/home";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { Eyebrow, TextLink } from "@/components/ui/primitives";
import { useCursor } from "@/components/site/cursor";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { newWork } from "@/lib/editor/new-entities";

/**
 * Home featured work — a deliberately asymmetric editorial sequence,
 * distinct from the /gallery index. Up to five works: one full-bleed, an
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
      <section className="u-container py-28 md:py-44">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>
              <EditableText bind="home.featured.eyebrow">{copy.eyebrow}</EditableText>
            </Eyebrow>
            <EditableText
              as="h2"
              bind="home.featured.heading"
              className="mt-4 font-display text-[clamp(1.6rem,1rem+2.2vw,2.8rem)]"
            >
              {copy.heading}
            </EditableText>
          </div>
          <TextLink href="/gallery">
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
            itemLabel={(w) => w.title || "Artwork"}
          >
            {(w, i) => (
              <article>
                <EditableImage bind={`@works.${i}.coverImage`} folder="work">
                  {w.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.coverImage}
                      alt={w.title}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-square place-items-center bg-neutral-100 text-[12px] text-neutral-400">
                      Click to add a cover
                    </div>
                  )}
                </EditableImage>
                <h3 className="mt-4 font-display text-[1.1rem] text-ink">
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

  if (!works.length) return null;

  const linkProps = {
    onPointerEnter: () => setCursor("view"),
    onPointerLeave: reset,
  };

  return (
    <section className="u-container py-28 md:py-44">
      <Reveal className="mb-14 flex items-end justify-between gap-6">
        <div>
          <Eyebrow>
            <EditableText bind="home.featured.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="home.featured.heading"
            className="mt-4 font-display text-[clamp(1.6rem,1rem+2.2vw,2.8rem)]"
          >
            {copy.heading}
          </EditableText>
        </div>
        <TextLink href="/gallery">
          <EditableText bind="home.featured.linkLabel">{copy.linkLabel}</EditableText>
        </TextLink>
      </Reveal>

      {/* One schematic: every cell the same width, every plate the same
          ratio. The rhythm comes from the works, not from the boxes. */}
      <StaggerList className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
        {works.map((work, i) => (
          <StaggerItem as="article" key={work.slug} className="group/art">
            <Link
              href={`/gallery/${work.slug}`}
              className="block focus-visible:outline-offset-8"
              {...linkProps}
            >
              <div className="u-plate u-artframe u-artframe--lift">
                <ArtImage
                  src={work.coverImage}
                  alt={work.images[0]?.alt ?? work.title}
                  width={work.images[0]?.width ?? 2200}
                  height={work.images[0]?.height ?? 2200}
                  fit="cover"
                  priority={i < 3}
                  sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                  placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                  blurDataURL={blurFor(work.coverImage)}
                  wrapperClassName="h-full w-full"
                />
              </div>
              <Caption work={work} className="mt-5" />
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}

function Caption({ work, className }: { work: Work; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h3 className="font-display text-[1.05rem] leading-snug text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:translate-x-0.5">
        {work.title}
      </h3>
      <p className="u-eyebrow">
        {[DISCIPLINE_LABELS[work.discipline], work.year].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}
