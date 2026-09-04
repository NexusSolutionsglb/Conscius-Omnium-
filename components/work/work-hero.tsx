"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import type { Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";
import { useLightbox } from "./lightbox";

export function WorkHero({ work }: { work: Work }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const { setCursor, reset } = useCursor();
  const { open } = useLightbox();

  return (
    <div className="u-container pt-28 md:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <nav aria-label="Breadcrumb" className="u-eyebrow">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-ink-faint">
                /
              </li>
              <li>
                <Link href="/work" className="transition-colors hover:text-ink">
                  Selected Work
                </Link>
              </li>
              <li aria-hidden className="text-ink-faint">
                /
              </li>
              <li>
                <Link
                  href={`/work?discipline=${work.discipline}`}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {DISCIPLINE_LABELS[work.discipline]}
                </Link>
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,1.3rem+3.6vw,4.4rem)] font-light leading-[1.03]">
            {work.title}
          </h1>
        </div>
        {work.year && (
          <span className="font-display text-[1.5rem] font-light text-ink-faint">
            {work.year}
          </span>
        )}
      </div>

      <div ref={ref} className="mt-10 overflow-hidden md:mt-14">
        <motion.div style={{ y }}>
          <button
            type="button"
            onClick={() => open(work.images, 0)}
            onPointerEnter={() => setCursor("open", "Open")}
            onPointerLeave={reset}
            className="block w-full"
            aria-label={`Open ${work.title} full screen`}
          >
            <ArtImage
              src={work.coverImage}
              alt={work.images[0]?.alt ?? work.title}
              width={work.images[0]?.width ?? 2200}
              height={work.images[0]?.height ?? 1500}
              priority
              noReveal
              sizes="(min-width:1280px) 90vw, 100vw"
              placeholder={blurFor(work.coverImage) ? "blur" : "empty"}
              blurDataURL={blurFor(work.coverImage)}
              wrapperClassName="w-full"
            />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
