"use client";

import type { ImageKind, WorkImage } from "@/lib/types";
import { blurFor } from "@/lib/content/blur";
import { cn } from "@/lib/utils";
import { ArtImage } from "@/components/motion/image-reveal";
import { Reveal } from "@/components/motion/reveal";
import { useCursor } from "@/components/site/cursor";
import { useLightbox } from "./lightbox";

const KIND_LABEL: Record<ImageKind, string> = {
  cover: "",
  gallery: "",
  detail: "Detail",
  installation: "Installation",
  process: "Process",
  drawing: "Drawing",
  render: "Render",
};

/**
 * The image sequence on a work detail page. The cover is shown large by
 * the page hero; this renders every *other* image, alternating full and
 * inset widths, each opening the fullscreen viewer.
 */
export function WorkGallery({ images }: { images: WorkImage[] }) {
  const { open } = useLightbox();
  const { setCursor, reset } = useCursor();

  const gallery = images.filter((_, i) => i > 0);
  if (!gallery.length) return null;

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {gallery.map((image, i) => {
        const lightboxIndex = images.findIndex((im) => im.id === image.id);
        const full = i % 3 === 0;
        return (
          <Reveal key={image.id} className={cn(!full && "mx-auto w-full max-w-4xl")}>
            <figure>
              <button
                type="button"
                onClick={() => open(images, lightboxIndex)}
                onPointerEnter={() => setCursor("open", "Open")}
                onPointerLeave={reset}
                className="block w-full"
                aria-label={`Open image: ${image.alt}`}
              >
                <ArtImage
                  src={image.url}
                  alt={image.alt}
                  width={image.width ?? 2200}
                  height={image.height ?? 1500}
                  sizes={full ? "(min-width:1024px) 90vw, 100vw" : "(min-width:1024px) 60vw, 100vw"}
                  placeholder={blurFor(image.url) ? "blur" : "empty"}
                  blurDataURL={blurFor(image.url)}
                  wrapperClassName="w-full"
                />
              </button>
              {(image.caption || KIND_LABEL[image.kind]) && (
                <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 text-[0.75rem] text-ink-mute">
                  {KIND_LABEL[image.kind] && (
                    <span className="u-eyebrow">{KIND_LABEL[image.kind]}</span>
                  )}
                  {image.caption && <span className="max-w-xl">{image.caption}</span>}
                </figcaption>
              )}
            </figure>
          </Reveal>
        );
      })}
    </div>
  );
}
