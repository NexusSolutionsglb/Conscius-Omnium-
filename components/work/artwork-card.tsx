"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Work } from "@/lib/types";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { fadeUp } from "@/lib/motion";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";

/**
 * A gallery-wall card for photographed artwork. Unlike `WorkCard`, the
 * image keeps its true intrinsic proportions (no forced ratio, no crop) —
 * a portrait stays portrait, a landscape stays landscape — and sits on a
 * restrained "elevated print" treatment: a soft shadow behind the image
 * and a thin mat, rather than a flat card.
 */
export function ArtworkCard({ work, priority = false }: { work: Work; priority?: boolean }) {
  const { setCursor, reset } = useCursor();
  const cover = work.images[0];
  const width = cover?.width ?? 2200;
  const height = cover?.height ?? 1600;
  const sold = work.availability === "sold";

  return (
    <motion.article variants={fadeUp} className="group/art mb-8 break-inside-avoid sm:mb-10">
      <Link
        href={`/gallery/${work.slug}`}
        className="block focus-visible:outline-offset-8"
        onPointerEnter={() => setCursor("view")}
        onPointerLeave={reset}
        aria-label={`${work.title} — open`}
      >
        <div className="relative p-2.5 pb-5 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_18px_38px_-14px_rgba(0,0,0,0.22)] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:-translate-y-1 group-hover/art:shadow-[0_4px_10px_rgba(0,0,0,0.06),0_28px_54px_-16px_rgba(0,0,0,0.28)]">
          <ArtImage
            src={work.coverImage}
            alt={cover?.alt ?? work.title}
            width={width}
            height={height}
            sizes="(min-width:1024px) 32vw, (min-width:640px) 46vw, 92vw"
            priority={priority}
            placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
            blurDataURL={blurFor(work.coverImage)}
            wrapperClassName="w-full bg-paper"
            className="w-full"
          />
          {sold && (
            <span className="absolute left-4.5 top-4.5 z-10 bg-obsidian/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-paper backdrop-blur-sm">
              Sold
            </span>
          )}
        </div>

        <div className="mt-4 px-1">
          <h3 className="font-display text-[1.2rem] font-normal leading-tight text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:translate-x-0.5">
            {work.title}
          </h3>
          <p className="u-eyebrow mt-1.5">
            {[work.year, work.medium].filter(Boolean).join(" · ")}
          </p>
          {(work.dimensions || (work.priceVisible && work.price)) && (
            <p className="mt-1 text-[0.78rem] text-ink-mute">
              {[
                work.dimensions,
                work.priceVisible && work.price
                  ? `₹${work.price.toLocaleString("en-IN")}`
                  : !work.priceVisible && !sold
                    ? AVAILABILITY_LABELS[work.availability]
                    : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
