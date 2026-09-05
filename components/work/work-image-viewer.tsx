"use client";

import { useEffect, useState } from "react";
import type { WorkImage } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { useCursor } from "@/components/site/cursor";
import { useLightbox } from "./lightbox";

const KIND_LABELS: Record<WorkImage["kind"], string> = {
  cover: "The work",
  gallery: "View",
  detail: "Detail",
  installation: "In place",
  drawing: "Drawing",
  process: "Process",
  render: "Render",
};

/**
 * The artwork-detail image area. One image on the stage at a time — the
 * work itself first, then any context/installation shots, reached with the
 * arrows or the thumbnail strip below. The stage has a fixed height and the
 * image is scaled to fit inside it whole (never cropped), sitting on a paper
 * mount with a soft drop shadow so it reads as a print hung on a wall
 * rather than a picture pasted onto the page.
 */
export function WorkImageViewer({ images }: { images: WorkImage[] }) {
  const [index, setIndex] = useState(0);
  const { setCursor, reset } = useCursor();
  const { open } = useLightbox();

  const many = images.length > 1;

  // A work can be re-rendered with a different image set in the editor.
  useEffect(() => {
    setIndex((i) => (i < images.length ? i : 0));
  }, [images.length]);

  if (!images.length) return null;

  const current = images[index] ?? images[0];
  const currentWidth = current.width ?? 2200;
  const currentHeight = current.height ?? 1500;
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="u-container">
      <div className="relative mx-auto flex max-w-5xl justify-center">
        {/* Stage — the mount hugs the artwork, whatever shape it is.
            Sizing lives HERE, on the button, not on `ArtImage`'s own
            wrapper: a shrink-wrapping ancestor takes its width from the
            `<img>`'s intrinsic size, which the browser bases on whichever
            responsive resource happens to be downloaded (e.g. 768px at
            this viewport) rather than the CSS-computed rendered size —
            the two silently disagree, leaving a gap between the frame and
            the picture. Instead the button gets `aspect-ratio` directly
            with BOTH width and height left `auto`, bounded only by
            `max-width` (the page) and `max-height` (below) — the browser's
            native "largest box satisfying the ratio within both bounds"
            resolution then picks height-bound sizing for an ordinary photo
            (snug, matches the old fixed-height look exactly) and
            width-bound sizing for an unusually wide or tall one (a banner,
            a panorama), shrinking it to fit instead of overflowing the
            page — with no fixed dimension fighting the ratio either way. */}
        <button
          type="button"
          onClick={() => open(images, index)}
          onPointerEnter={() => setCursor("open", "Open")}
          onPointerLeave={reset}
          className="u-artframe block w-full h-auto self-start md:mx-auto md:w-auto md:max-w-full md:h-auto md:max-h-[clamp(20rem,75vh,54rem)]"
          style={{ aspectRatio: `${currentWidth} / ${currentHeight}` }}
          aria-label={`Open full screen: ${current.alt}`}
        >
          <ArtImage
            key={current.id}
            src={current.url}
            alt={current.alt}
            width={currentWidth}
            height={currentHeight}
            fit="contain"
            priority={index === 0}
            noReveal
            sizes="(min-width:1024px) 60vw, 92vw"
            placeholder={blurFor(current.url) ? "blur" : "empty"}
            blurDataURL={blurFor(current.url)}
            wrapperClassName="w-full h-full"
          />
        </button>

        {many && (
          <>
            <ArrowButton dir="prev" onClick={() => go(-1)} />
            <ArrowButton dir="next" onClick={() => go(1)} />
          </>
        )}
      </div>

      {/* Caption + position */}
      <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-center">
        <span className="u-eyebrow">{KIND_LABELS[current.kind]}</span>
        {current.caption && (
          <span className="text-[0.82rem] leading-relaxed text-ink-mute">
            {current.caption}
          </span>
        )}
        {many && (
          <span className="u-eyebrow text-ink-faint">
            {index + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {many && (
        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-3">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${KIND_LABELS[image.kind].toLowerCase()}: ${image.alt}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "u-artframe--sm block p-1.5 outline-offset-4 transition-opacity",
                i === index
                  ? "ring-1 ring-ink"
                  : "opacity-65 hover:opacity-100",
              )}
            >
              <ArtImage
                src={image.url}
                alt=""
                width={image.width ?? 2200}
                height={image.height ?? 1500}
                fit="contain"
                noReveal
                sizes="88px"
                placeholder={blurFor(image.url) ? "blur" : "empty"}
                blurDataURL={blurFor(image.url)}
                wrapperClassName="h-14 w-14 md:h-[4.5rem] md:w-[4.5rem]"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: () => void;
}) {
  const prev = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={prev ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line-strong bg-paper text-ink shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)] transition-colors hover:bg-paper-dim",
        prev ? "left-2 md:-left-6" : "right-2 md:-right-6",
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={prev ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
