"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Work } from "@/lib/types";
import { AVAILABILITY_LABELS, DISCIPLINE_LABELS } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";

export type CardSize = "wide" | "portrait" | "square" | "standard";

const RATIO: Record<CardSize, string> = {
  wide: "16 / 9",
  portrait: "4 / 5",
  square: "1 / 1",
  standard: "3 / 2",
};

const SIZES: Record<CardSize, string> = {
  wide: "(min-width: 1024px) 92vw, 100vw",
  portrait: "(min-width: 1024px) 42vw, (min-width: 640px) 60vw, 100vw",
  square: "(min-width: 1024px) 42vw, (min-width: 640px) 60vw, 100vw",
  standard: "(min-width: 1024px) 60vw, 100vw",
};

export function WorkCard({
  work,
  size = "standard",
  priority = false,
  align = "left",
  className,
}: {
  work: Work;
  size?: CardSize;
  priority?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const { setCursor, reset } = useCursor();
  const sold = work.availability === "sold";

  return (
    <motion.article
      variants={fadeUp}
      className={cn("group/card", className)}
    >
      <Link
        href={`/gallery/${work.slug}`}
        className="block focus-visible:outline-offset-8"
        onPointerEnter={() => setCursor("view")}
        onPointerLeave={reset}
        aria-label={`${work.title} — ${DISCIPLINE_LABELS[work.discipline]}`}
      >
        <div className="relative shadow-[0_8px_24px_rgba(0,0,0,0.12),_0_20px_60px_rgba(0,0,0,0.10),_0_2px_6px_rgba(0,0,0,0.08)] transition-shadow duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:shadow-[0_16px_40px_rgba(0,0,0,0.18),_0_32px_80px_rgba(0,0,0,0.14),_0_4px_12px_rgba(0,0,0,0.10)]">
          <ArtImage
            src={work.coverImage}
            alt={work.images[0]?.alt ?? work.title}
            ratio={RATIO[size]}
            fill
            sizes={SIZES[size]}
            hoverZoom
            priority={priority}
            placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
            blurDataURL={blurFor(work.coverImage)}
            wrapperClassName="w-full"
          />
          {sold && (
            <span className="absolute left-4 top-4 z-10 bg-obsidian/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-paper backdrop-blur-sm">
              Sold
            </span>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <span className="bg-paper/95 px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-ink backdrop-blur-sm">
              View work
            </span>
          </span>
        </div>

        <div
          className={cn(
            "mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5 border-t border-line pt-4",
            align === "center" && "justify-center text-center",
            align === "right" && "flex-row-reverse text-right",
          )}
        >
          <div>
            <h3 className="font-display text-[1.35rem] font-normal leading-tight text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:translate-x-0.5">
              {work.title}
            </h3>
            <p className="u-eyebrow mt-1.5">
              {[DISCIPLINE_LABELS[work.discipline], work.year].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div
            className={cn(
              "max-w-[16rem] text-[0.78rem] leading-relaxed text-ink-mute",
              align === "left" && "sm:text-right",
            )}
          >
            {work.medium && <p>{work.medium}</p>}
            {work.dimensions && <p className="text-ink-faint">{work.dimensions}</p>}
            {!work.medium && !work.dimensions && (
              <p className="text-ink-faint">{AVAILABILITY_LABELS[work.availability]}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
