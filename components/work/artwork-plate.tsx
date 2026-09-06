"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Work } from "@/lib/types";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";

/**
 * One artwork on the wall.
 *
 * Every plate in the gallery is the same shape (`--plate-ratio`, square by
 * default) so a series reads as one curated hang rather than a pile of
 * differently-sized cards, and the painting fills it edge to edge — no
 * mount, no paper margin, no border. Nothing shows but the work, with one
 * quiet drop shadow falling from the image itself and the caption outside
 * the frame. The full, uncropped painting is one click away on its own
 * page, where the viewer sizes itself to the work's real proportions.
 */
export function ArtworkPlate({
  work,
  priority = false,
  className,
  animate = true,
}: {
  work: Work;
  priority?: boolean;
  className?: string;
  /** Off inside a horizontal rail, where the stagger reveal fights the scroll. */
  animate?: boolean;
}) {
  const { setCursor, reset } = useCursor();
  const cover = work.images[0];
  const sold = work.availability === "sold";
  const meta = [work.year, work.medium].filter(Boolean).join(" · ");
  const detail = [
    work.dimensions,
    work.priceVisible && work.price
      ? `₹${work.price.toLocaleString("en-IN")}`
      : !work.priceVisible && !sold
        ? AVAILABILITY_LABELS[work.availability]
        : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const Wrapper = animate ? motion.article : "article";

  return (
    <Wrapper
      {...(animate ? { variants: fadeUp } : {})}
      className={cn("group/art", className)}
    >
      <Link
        href={`/gallery/${work.slug}`}
        className="block focus-visible:outline-offset-8"
        onPointerEnter={() => setCursor("view")}
        onPointerLeave={reset}
        aria-label={`${work.title} — open`}
      >
        <div className="u-plate u-artframe u-artframe--lift">
          <ArtImage
            src={work.coverImage}
            alt={cover?.alt ?? work.title}
            width={cover?.width ?? 2200}
            height={cover?.height ?? 2200}
            sizes="(min-width:1280px) 24vw, (min-width:768px) 40vw, 78vw"
            priority={priority}
            placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
            blurDataURL={blurFor(work.coverImage)}
            fit="cover"
            noReveal={!animate}
            wrapperClassName="h-full w-full"
          />
          {sold && (
            <span className="absolute left-3 top-3 z-10 bg-ink/80 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-paper">
              Sold
            </span>
          )}
        </div>

        <div className="mt-5">
          <h3 className="font-display text-[1.05rem] leading-snug text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:translate-x-0.5">
            {work.title}
          </h3>
          {meta && <p className="u-eyebrow mt-1.5">{meta}</p>}
          {detail && <p className="mt-1 text-[0.76rem] text-ink-mute">{detail}</p>}
        </div>
      </Link>
    </Wrapper>
  );
}
