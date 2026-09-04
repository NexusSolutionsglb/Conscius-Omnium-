"use client";

import { useRef, useState, useEffect } from "react";
import type { WorkImage } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";
import { useLightbox } from "./lightbox";

/**
 * The artwork-detail image area — a horizontally-scrolling, snap-to-image
 * strip (cover + any context/installation shots) with left/right arrow
 * controls, matching the client's sketch ("scroll left to right"). Each
 * image keeps its own intrinsic aspect ratio; nothing is cropped.
 */
export function WorkImageScroller({ images }: { images: WorkImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(images.length > 1);
  const { setCursor, reset } = useCursor();
  const { open } = useLightbox();

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    updateArrows();
  }, [images.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.92, behavior: "smooth" });
  };

  if (!images.length) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[max(1.25rem,calc((100vw-1560px)/2+1.25rem))] pb-2 md:px-[max(2.75rem,calc((100vw-1560px)/2+2.75rem))]"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => open(images, i)}
            onPointerEnter={() => setCursor("open", "Open")}
            onPointerLeave={reset}
            className="block shrink-0 snap-center"
            style={{ maxWidth: "min(92vw, 1100px)" }}
            aria-label={`Open image: ${image.alt}`}
          >
            <ArtImage
              src={image.url}
              alt={image.alt}
              width={image.width ?? 2200}
              height={image.height ?? 1500}
              priority={i === 0}
              noReveal={i === 0}
              sizes="92vw"
              placeholder={blurFor(image.url) ? "blur" : "empty"}
              blurDataURL={blurFor(image.url)}
              className="max-h-[70vh] w-auto"
              wrapperClassName="max-h-[70vh]"
            />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Previous image"
            className="flex h-10 w-10 items-center justify-center border border-line-strong text-ink transition-colors hover:bg-paper-dim disabled:opacity-30"
          >
            <span aria-hidden>&larr;</span>
          </button>
          <span className="u-eyebrow text-ink-faint">Scroll for more</span>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Next image"
            className="flex h-10 w-10 items-center justify-center border border-line-strong text-ink transition-colors hover:bg-paper-dim disabled:opacity-30"
          >
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}
