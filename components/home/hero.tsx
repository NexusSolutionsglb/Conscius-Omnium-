"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { HeroConfig, Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { blurFor } from "@/lib/content/blur";
import { ArtImage } from "@/components/motion/image-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { useCursor } from "@/components/site/cursor";

export function Hero({ hero, work }: { hero: HeroConfig; work: Work | null }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 46]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const { setCursor, reset } = useCursor();

  const image = work?.coverImage ?? hero.image ?? "/work/ghosts-takht-mahal.jpg";
  const alt = work?.images[0]?.alt ?? "Featured work by Shivjeet Potdar";
  const headingLines = hero.heading.split("\n");

  return (
    <section
      ref={ref}
      className="u-invert relative flex h-[100svh] min-h-[600px] flex-col justify-end overflow-hidden"
    >
      <motion.div style={{ y: imageY }} className="absolute inset-[-6%_0_0_0] -z-20">
        <ArtImage
          src={image}
          alt={alt}
          fill
          priority
          noReveal
          sizes="100vw"
          placeholder={blurFor(image) ? "blur" : "empty"}
          blurDataURL={blurFor(image)}
          className="object-cover [filter:contrast(1.05)_saturate(1.03)_brightness(0.9)]"
          wrapperClassName="h-full w-full"
        />
      </motion.div>

      {/* legibility scrim */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(12,10,8,0.9)_0%,rgba(12,10,8,0.62)_38%,rgba(12,10,8,0.24)_66%,rgba(12,10,8,0.34)_100%)]" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="u-container relative z-10 pb-[14vh] pt-28"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE.outExpo, delay: 0.15 }}
          className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-paper/70"
        >
          {hero.eyebrow}
        </motion.p>

        <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(2.5rem,1.1rem+5.4vw,5.8rem)] font-light leading-[1.03] tracking-[-0.02em] text-paper md:mt-7">
          {headingLines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE.outExpo, delay: 0.28 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.outExpo, delay: 0.62 }}
          className="mt-9 flex flex-wrap items-end justify-between gap-x-8 gap-y-5"
        >
          <Magnetic>
            <Link
              href={hero.ctaHref}
              onPointerEnter={() => setCursor("view", "Enter")}
              onPointerLeave={reset}
              className="inline-flex items-center gap-3 border border-paper/35 px-8 py-3.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:border-paper hover:bg-paper/10"
            >
              {hero.ctaLabel}
              <span aria-hidden>&rarr;</span>
            </Link>
          </Magnetic>

          {hero.showMeta && work && (
            <div className="max-w-[16rem] text-[0.72rem] leading-relaxed text-paper/55 sm:text-right">
              <p className="text-paper/85">{work.title}</p>
              <p>
                {[DISCIPLINE_LABELS[work.discipline], work.year, work.medium]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {work.dimensions && <p>{work.dimensions}</p>}
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-paper/45 lg:flex"
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="relative block h-9 w-px overflow-hidden bg-paper/20">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-paper/70"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
