"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { HeroConfig } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { useCursor } from "@/components/site/cursor";
import { EditableText } from "@/components/editor/editable-text";
import { useNodeProps } from "@/components/editor/use-editable";
import { HeroVideo } from "./hero-video";

/**
 * The full-bleed hero — a cinematic loop of the studio and the work, carrying
 * centred "AWARENESS THROUGH ART" / "by SHIVJEET POTDAR" and a single "Seek"
 * CTA into the enquiry form. The film (see `hero-video.tsx`, encode in
 * /public/hero-media) starts the instant the section paints, blends into the
 * page's red / grain language, and falls back to a plain deep-red field if it
 * can't load. `hero.video`, when set in Admin, overrides the default clip.
 */
export function Hero({ hero }: { hero: HeroConfig }) {
  const { setCursor, reset } = useCursor();
  const nodeProps = useNodeProps("home", "@settings.hero", "hero", "Hero");

  // The client asked for the name to read in capitals under the mixed-case
  // line — do it at render so it holds whatever the stored copy says.
  const supporting = hero.supporting.replace(
    /shivjeet potdar/gi,
    "SHIVJEET POTDAR",
  );

  return (
    <section
      {...nodeProps}
      className="u-invert relative flex h-[100svh] min-h-[560px] flex-col items-center justify-center overflow-hidden bg-[#160c0b]"
    >
      <HeroVideo override={hero.video} />

      <div className="u-container relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.outExpo, delay: 0.15 }}
          className="font-sans text-[clamp(1.5rem,0.9rem+2.6vw,3rem)] font-normal uppercase leading-tight tracking-[0.14em] text-paper"
        >
          <EditableText bind="@settings.hero.heading">{hero.heading}</EditableText>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.outExpo, delay: 0.3 }}
          className="mt-3 font-sans text-[clamp(1.25rem,0.8rem+2vw,2.3rem)] italic leading-tight tracking-[0.04em] text-paper/90"
        >
          <EditableText bind="@settings.hero.supporting">{supporting}</EditableText>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.outExpo, delay: 0.5 }}
          className="mt-10"
        >
          <Magnetic>
            <Link
              href={hero.ctaHref}
              onPointerEnter={() => setCursor("view", "Enter")}
              onPointerLeave={reset}
              className="inline-flex items-center gap-3 border border-paper/70 px-10 py-3.5 text-[0.72rem] uppercase tracking-[0.28em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-[#c81e1e]"
            >
              <EditableText bind="@settings.hero.ctaLabel">{hero.ctaLabel}</EditableText>
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-paper/60 lg:flex"
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="relative block h-9 w-px overflow-hidden bg-paper/25">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-paper/80"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
