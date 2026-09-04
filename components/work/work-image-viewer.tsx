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
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="u-container">
      <div className="relative mx-auto flex max-w-5xl justify-center">
        {/* Stage — the mount hugs the artwork, whatever shape it is */}
        <button
          type="button"
          onClick={() => open(images, index)}
          onPointerEnter={() => setCursor("open", "Open")}
          onPointerLeave={reset}
          className="u-artframe inline-block max-w-full p-3 md:p-4"
          aria-label={`Open full screen: ${current.alt}`}
        >
          <ArtImage
            key={current.id}
            src={current.url}
            alt={current.alt}
            width={current.width ?? 2200}
            height={current.height ?? 1500}
            fit="contain"
            // The stage is a fixed height and takes its width from this
            // image's own proportions, so the mount hugs a portrait as
            // closely as a landscape and nothing is ever cut off.
            ratio={`${current.width ?? 2200} / ${current.height ?? 1500}`}
            priority={index === 0}
            noReveal
            sizes="(min-width:1024px) 60vw, 92vw"
            placeholder={blurFor(current.url) ? "blur" : "empty"}
            blurDataURL={blurFor(current.url)}
            wrapperClassName="h-[clamp(15rem,56vh,42rem)] max-w-full bg-paper"
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
                wrapperClassName="h-14 w-14 bg-paper md:h-[4.5rem] md:w-[4.5rem]"
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
