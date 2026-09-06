"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Series } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";

/**
 * A series on the main gallery wall. Same plate, same shadow and the same
 * caption rhythm as an artwork — the only difference is the count line, so
 * the eye reads the whole page as one system and the click target is
 * obvious: this opens a room, not a picture.
 */
export function SeriesCard({
  series,
  priority = false,
  className,
  animate = true,
}: {
  series: Series;
  priority?: boolean;
  className?: string;
  animate?: boolean;
}) {
  const { setCursor, reset } = useCursor();
  const count = series.works.length;
  const Wrapper = animate ? motion.article : "article";

  return (
    <Wrapper
      {...(animate ? { variants: fadeUp } : {})}
      className={cn("group/art", className)}
    >
      <Link
        href={`/gallery/collection/${series.slug}`}
        className="block focus-visible:outline-offset-8"
        onPointerEnter={() => setCursor("view", "Series")}
        onPointerLeave={reset}
        aria-label={`${series.title} — open the series`}
      >
        <div className="u-plate u-artframe u-artframe--lift">
          {series.plateImage ? (
            <ArtImage
              src={series.plateImage}
              alt={series.title}
              width={2200}
              height={2200}
              sizes="(min-width:1280px) 30vw, (min-width:768px) 44vw, 88vw"
              priority={priority}
              placeholder={blurFor(series.plateImage) ? "blur" : "empty"}
              blurDataURL={blurFor(series.plateImage)}
              fit="cover"
              wrapperClassName="h-full w-full"
            />
          ) : (
            <span className="u-eyebrow text-ink-faint">{series.title}</span>
          )}
        </div>

        <div className="mt-5">
          <h3 className="font-display text-[1.25rem] leading-snug text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:translate-x-0.5">
            {series.title}
          </h3>
          <p className="u-eyebrow mt-2">
            {count > 0 ? `${count} ${count === 1 ? "work" : "works"}` : "Series"}
            {series.period ? ` · ${series.period}` : ""}
          </p>
          {series.description && (
            <p className="mt-3 line-clamp-3 max-w-sm text-[0.82rem] leading-relaxed text-ink-mute">
              {series.description}
            </p>
          )}
        </div>
      </Link>
    </Wrapper>
  );
}
