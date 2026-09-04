"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { HeroConfig } from "@/lib/types";
import { EASE } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { useCursor } from "@/components/site/cursor";
import { EditableText } from "@/components/editor/editable-text";
import { EditableImage } from "@/components/editor/editable-image";
import { useNodeProps } from "@/components/editor/use-editable";

/**
 * The full-bleed red hero — matches the client's reference sketch: a
 * saturated red field, centred "AWARENESS THROUGH ART" (bold) / "BY
 * SHIVJEET POTDAR" (italic, same size), and a single "Seek" CTA into the
 * enquiry form. Built video-ready: `hero.video` fills the background the
 * instant a real clip is supplied; until then it's a plain deep-red field
 * (no stock footage, no invented photography).
 */
export function Hero({ hero }: { hero: HeroConfig }) {
  const { setCursor, reset } = useCursor();
  const nodeProps = useNodeProps("home", "@settings.hero", "hero", "Hero");

  return (
    <section
      {...nodeProps}
      className="u-invert relative flex h-[100svh] min-h-[560px] flex-col items-center justify-center overflow-hidden bg-[#c81e1e]"
    >
      {hero.video ? (
        <EditableImage bind="@settings.hero.video" folder="hero">
          <video
            src={hero.video}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        </EditableImage>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_18%,#e2372b_0%,#c81e1e_46%,#9c1414_100%)]"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(0,0,0,0.32)_0%,transparent_70%)]" />

      <div className="u-container relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.outExpo, delay: 0.15 }}
          className="font-sans text-[clamp(1.5rem,0.9rem+2.6vw,3rem)] font-bold uppercase leading-tight tracking-[0.04em] text-paper"
        >
          <EditableText bind="@settings.hero.heading">{hero.heading}</EditableText>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE.outExpo, delay: 0.3 }}
          className="mt-2 font-sans text-[clamp(1.5rem,0.9rem+2.6vw,3rem)] italic leading-tight text-paper"
        >
          <EditableText bind="@settings.hero.supporting">{hero.supporting}</EditableText>
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
              className="inline-flex items-center gap-3 border border-paper px-10 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.24em] text-paper transition-colors hover:bg-paper hover:text-[#c81e1e]"
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
