"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Collection, HomeContent, SiteSettings } from "@/lib/types";
import { homeDefaults } from "@/lib/content/defaults/home";
import { EASE } from "@/lib/motion";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow, Rule, TextLink } from "@/components/ui/primitives";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { RepeatableList } from "@/components/editor/repeatable-list";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { newCollection } from "@/lib/editor/new-entities";

/* ── 02 · Artist introduction ─────────────────────────────── */

export function Intro({
  bio,
  settings,
  copy = homeDefaults.intro,
}: {
  bio: string[];
  settings: SiteSettings;
  copy?: HomeContent["intro"];
}) {
  return (
    <section className="u-container py-28 md:py-44">
      <div className="grid gap-14 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <Eyebrow>
            <EditableText bind="home.intro.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <Rule className="mt-5" />
        </Reveal>

        <div className="md:col-span-9 md:pl-6">
          <TextReveal
            as="p"
            text={settings.hero.heading.replace(/\n/g, " ")}
            className="font-display text-[clamp(1.6rem,1rem+2.4vw,2.9rem)] leading-[1.3] text-ink"
          />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Reveal className="u-prose text-[0.92rem] leading-[1.75]">
              <EditableText as="p" bind="@profile.bio.0" multiline>
                {bio[0] ?? ""}
              </EditableText>
            </Reveal>
            <Reveal delay={0.08} className="u-prose text-[0.92rem] leading-[1.75]">
              <EditableText as="p" bind="@profile.bio.1" multiline>
                {bio[1] ?? ""}
              </EditableText>
              <p className="mt-6">
                <TextLink href="/about">
                  <EditableText bind="home.intro.linkLabel">{copy.linkLabel}</EditableText>
                </TextLink>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 06 · Studio preview ──────────────────────────────────── */

export function StudioPreview({
  image,
  copy = homeDefaults.studioPreview,
}: {
  image: string;
  copy?: HomeContent["studioPreview"];
}) {
  return (
    <section className="u-container py-28 md:py-44">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <Reveal className="order-2 md:order-1">
          <Eyebrow>
            <EditableText bind="home.studioPreview.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="home.studioPreview.heading"
            linebreaks
            className="mt-5 font-display text-[clamp(1.8rem,1.1rem+2.6vw,3.2rem)] leading-[1.2]"
          >
            {copy.heading}
          </EditableText>
          <EditableText
            as="p"
            bind="home.studioPreview.body"
            multiline
            className="mt-6 max-w-md text-[0.92rem] leading-relaxed text-ink-soft"
          >
            {copy.body}
          </EditableText>
          <p className="mt-8">
            <TextLink href="/studio">
              <EditableText bind="home.studioPreview.linkLabel">{copy.linkLabel}</EditableText>
            </TextLink>
          </p>
        </Reveal>
        <Parallax amount={28} className="order-1 md:order-2">
          <EditableImage bind="home.studioPreview.image" folder="studio">
            <ArtImage
              src={copy.image || image}
              alt="A plaster miniature landscape from the studio, photographed to read as a full-scale world"
              ratio="4 / 5"
              fill
              sizes="(min-width:768px) 45vw, 100vw"
              placeholder={blurFor(copy.image || image) ? "blur" : "empty"}
              blurDataURL={blurFor(copy.image || image)}
            />
          </EditableImage>
        </Parallax>
      </div>
    </section>
  );
}

/* ── 08 · Selected collections ────────────────────────────── */

export function CollectionsRail({
  collections,
  copy = homeDefaults.collections,
}: {
  collections: Collection[];
  copy?: HomeContent["collections"];
}) {
  const editing = useEditorMode() === "edit";
  const live = useEditableData<Collection>("collections", collections);
  const shown = editing ? live : live.filter((c) => c.published).slice(0, 3);
  if (!editing && !shown.length) return null;

  return (
    <section className="u-container py-28 md:py-44">
      <Reveal className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>
            <EditableText bind="home.collections.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="home.collections.heading"
            className="mt-4 font-display text-[clamp(1.6rem,1rem+2.2vw,2.8rem)]"
          >
            {copy.heading}
          </EditableText>
        </div>
        <TextLink href="/gallery">
          <EditableText bind="home.collections.linkLabel">{copy.linkLabel}</EditableText>
        </TextLink>
      </Reveal>
      <StaggerList className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
        <RepeatableList
          slug="work"
          path="collections"
          items={shown}
          makeItem={newCollection}
          addLabel="Add a series"
          addClassName="py-2 sm:col-span-2 lg:col-span-3"
          listBind="@collections"
          kind="collection"
          itemLabel={(c) => c.title || "Series"}
        >
          {(c, i) => (
            <StaggerItem as="article" data-unpublished={editing && !c.published ? "" : undefined}>
              <Link href={`/gallery/collection/${c.slug}`} className="group/art block">
                <EditableImage bind={`@collections.${i}.coverImage`} folder="collection">
                  {c.coverImage ? (
                    <div className="u-plate u-artframe u-artframe--lift">
                      <ArtImage
                        src={c.coverImage}
                        alt={c.title}
                        width={2200}
                        height={2200}
                        fit="cover"
                        sizes="(min-width:1024px) 30vw, 45vw"
                        placeholder={blurFor(c.coverImage) ? "blur" : "empty"}
                        blurDataURL={blurFor(c.coverImage)}
                        wrapperClassName="h-full w-full"
                      />
                    </div>
                  ) : editing ? (
                    <div className="grid aspect-square place-items-center bg-neutral-100 text-[12px] text-neutral-400">
                      Click to add a cover
                    </div>
                  ) : null}
                </EditableImage>
                <h3 className="mt-5 font-display text-[1.2rem] text-ink">
                  <EditableText bind={`@collections.${i}.title`}>{c.title}</EditableText>
                </h3>
                <p className="mt-2.5 line-clamp-2 max-w-xs text-[0.82rem] leading-relaxed text-ink-mute">
                  <EditableText bind={`@collections.${i}.description`} multiline>
                    {c.description}
                  </EditableText>
                </p>
              </Link>
            </StaggerItem>
          )}
        </RepeatableList>
      </StaggerList>
    </section>
  );
}

/* ── 09 · Contact CTA ─────────────────────────────────────── */

export function ContactCta({
  heading,
  supporting,
  copy = homeDefaults.contactCta,
}: {
  heading: string;
  supporting: string;
  copy?: HomeContent["contactCta"];
}) {
  return (
    <section className="u-invert relative overflow-hidden bg-obsidian py-32 text-paper md:py-48">
      <div className="u-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE.outExpo }}
        >
          <Eyebrow className="text-paper/50">
            <EditableText bind="home.contactCta.eyebrow">{copy.eyebrow}</EditableText>
          </Eyebrow>
          <EditableText
            as="h2"
            bind="@settings.contactCopy.heading"
            className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2rem,1.2rem+3.6vw,4rem)] leading-[1.12]"
          >
            {heading}
          </EditableText>
          <EditableText
            as="p"
            bind="@settings.contactCopy.supporting"
            multiline
            className="mx-auto mt-5 max-w-md text-[0.92rem] leading-relaxed text-paper/60"
          >
            {supporting}
          </EditableText>
          <Link
            href="/contact"
            className={cn(
              "mt-10 inline-flex items-center gap-3 bg-paper px-9 py-4 text-[0.6875rem] uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5",
            )}
          >
            <EditableText bind="home.contactCta.ctaLabel">{copy.ctaLabel}</EditableText>
          </Link>
        </motion.div>
      </div>
      <div className="u-grain pointer-events-none absolute inset-0 opacity-40" />
    </section>
  );
}
