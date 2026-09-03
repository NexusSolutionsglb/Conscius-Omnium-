"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Collection, Profile, SiteSettings, Work } from "@/lib/types";
import { DISCIPLINE_LABELS, type Discipline } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Eyebrow, Rule, TextLink } from "@/components/ui/primitives";
import { useCursor } from "@/components/site/cursor";

/* ── 02 · Artist introduction ─────────────────────────────── */

export function Intro({
  profile,
  settings,
}: {
  profile: Profile;
  settings: SiteSettings;
}) {
  return (
    <section className="u-container py-24 md:py-36">
      <div className="grid gap-14 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <Eyebrow>The practice</Eyebrow>
          <Rule className="mt-5" />
        </Reveal>

        <div className="md:col-span-9 md:pl-6">
          <TextReveal
            as="p"
            text={settings.hero.heading.replace(/\n/g, " ")}
            className="font-display text-[clamp(1.6rem,1rem+2.4vw,2.9rem)] font-light leading-[1.22] text-ink"
          />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Reveal className="u-prose text-[0.92rem] leading-[1.75]">
              <p>{profile.bio[0]}</p>
            </Reveal>
            <Reveal delay={0.08} className="u-prose text-[0.92rem] leading-[1.75]">
              <p>{profile.bio[1]}</p>
              <p className="mt-6">
                <TextLink href="/about">Read the full story</TextLink>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 04 · Disciplines ─────────────────────────────────────── */

type DisciplineCard = {
  discipline: Discipline;
  work: Work;
  blurb: string;
};

export function Disciplines({ cards }: { cards: DisciplineCard[] }) {
  const { setCursor, reset } = useCursor();
  return (
    <section className="border-y border-line bg-paper-dim/50 py-24 md:py-36">
      <div className="u-container">
        <Reveal className="max-w-2xl">
          <Eyebrow>Across disciplines</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(1.8rem,1.1rem+2.8vw,3.4rem)] font-light leading-[1.12]">
            Different mediums, the same question.
          </h2>
          <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-ink-soft">
            What to do with the ruin, the eco-void, the monument — how to hold a
            place rather than erase it. The answer arrives as a building, a
            miniature, a render, or a title card.
          </p>
        </Reveal>

        <StaggerList className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ discipline, work, blurb }) => (
            <StaggerItem key={discipline} as="article">
              <Link
                href={`/work?discipline=${discipline}`}
                className="group block"
                onPointerEnter={() => setCursor("view")}
                onPointerLeave={reset}
              >
                <ArtImage
                  src={work.coverImage}
                  alt={work.images[0]?.alt ?? work.title}
                  ratio="5 / 4"
                  fill
                  sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
                  hoverZoom
                  placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
                  blurDataURL={blurFor(work.coverImage)}
                />
                <h3 className="mt-5 font-display text-[1.4rem] font-normal text-ink">
                  {DISCIPLINE_LABELS[discipline]}
                </h3>
                <p className="mt-2 max-w-xs text-[0.82rem] leading-relaxed text-ink-mute">
                  {blurb}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}

/* ── 06 · Studio preview ──────────────────────────────────── */

export function StudioPreview({ image }: { image: string }) {
  return (
    <section className="u-container py-24 md:py-36">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <Reveal className="order-2 md:order-1">
          <Eyebrow>Studio &amp; process</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(1.8rem,1.1rem+2.6vw,3.2rem)] font-light leading-[1.14]">
            Built at the scale
            <br />
            of a table.
          </h2>
          <p className="mt-6 max-w-md text-[0.92rem] leading-relaxed text-ink-soft">
            Plaster of Paris, box board, a piece of mirror for water, fern for a
            forest — then photographed at eye level until the model becomes a
            world. And sometimes, built at full scale.
          </p>
          <p className="mt-8">
            <TextLink href="/studio">Enter the studio</TextLink>
          </p>
        </Reveal>
        <Parallax amount={28} className="order-1 md:order-2">
          <ArtImage
            src={image}
            alt="A plaster miniature landscape from the studio, photographed to read as a full-scale world"
            ratio="4 / 5"
            fill
            sizes="(min-width:768px) 45vw, 100vw"
            placeholder={blurFor(image) ? "blur" : "empty"}
            blurDataURL={blurFor(image)}
          />
        </Parallax>
      </div>
    </section>
  );
}

/* ── 08 · Selected collections ────────────────────────────── */

export function CollectionsRail({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="u-container py-24 md:py-32">
      <Reveal className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>Series</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,1rem+2.2vw,2.8rem)] font-light">
            Bodies of work
          </h2>
        </div>
        <TextLink href="/work">All work</TextLink>
      </Reveal>
      <StaggerList className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {collections.slice(0, 3).map((c) => (
          <StaggerItem key={c.slug} as="article">
            <Link href={`/work/collection/${c.slug}`} className="group block">
              {c.coverImage && (
                <ArtImage
                  src={c.coverImage}
                  alt={c.title}
                  ratio="3 / 2"
                  fill
                  sizes="(min-width:1024px) 30vw, 45vw"
                  hoverZoom
                  placeholder={blurFor(c.coverImage) ? "blur" : "empty"}
                  blurDataURL={blurFor(c.coverImage)}
                />
              )}
              <h3 className="mt-4 font-display text-[1.3rem] text-ink">{c.title}</h3>
              <p className="mt-2 line-clamp-2 max-w-xs text-[0.82rem] leading-relaxed text-ink-mute">
                {c.description}
              </p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}

/* ── 09 · Contact CTA ─────────────────────────────────────── */

export function ContactCta({
  heading,
  supporting,
}: {
  heading: string;
  supporting: string;
}) {
  return (
    <section className="u-invert relative overflow-hidden bg-obsidian py-28 text-paper md:py-40">
      <div className="u-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE.outExpo }}
        >
          <Eyebrow className="text-paper/50">Contact</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2rem,1.2rem+3.6vw,4rem)] font-light leading-[1.08]">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[0.92rem] leading-relaxed text-paper/60">
            {supporting}
          </p>
          <Link
            href="/contact"
            className={cn(
              "mt-10 inline-flex items-center gap-3 bg-paper px-9 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5",
            )}
          >
            Start an enquiry
          </Link>
        </motion.div>
      </div>
      <div className="u-grain pointer-events-none absolute inset-0 opacity-40" />
    </section>
  );
}
