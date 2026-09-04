"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { motion, useInView } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ArtImageProps = Omit<ImageProps, "onLoad"> & {
  /** Wrapper aspect ratio, e.g. "3 / 2". Omit to let the image size itself. */
  ratio?: string;
  /** Disable the clip-wipe reveal (e.g. above the fold with priority). */
  noReveal?: boolean;
  wrapperClassName?: string;
  /** Slight zoom on hover — for cards. */
  hoverZoom?: boolean;
  /**
   * How the image sits in its box. "cover" fills and crops (cards with a
   * fixed `ratio`); "contain" scales the whole image down to fit, so a
   * painting is never cut off — use it wherever the artwork itself is the
   * subject.
   */
  fit?: "cover" | "contain";
};

/**
 * The canonical image for the site. A slow clip-path wipe as it enters
 * the viewport, then a progressive fade as the file decodes. Disabled
 * under prefers-reduced-motion by the global stylesheet.
 *
 * The reveal is gated on visibility only — never on the load event —
 * so a cached image (whose `onLoad` may never fire after hydration)
 * can't get stuck clipped. The opacity fade still waits for decode.
 */
export function ArtImage({
  ratio,
  noReveal = false,
  wrapperClassName,
  hoverZoom = false,
  fit = "cover",
  className,
  alt,
  ...props
}: ArtImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const [loaded, setLoaded] = useState(false);

  // Catch images that were already complete before hydration.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  // `loaded` is a safety net: if the observer never fires in some
  // embedded contexts, a decoded image still un-clips itself.
  const revealed = noReveal || inView || loaded;

  return (
    <div
      ref={ref}
      className={cn(
        "relative",
        // A contained image is letterboxed by design, so the caller owns the
        // ground behind it; a covered one fills its box, so the placeholder
        // tint only ever shows while it loads.
        fit === "contain"
          ? "flex items-center justify-center"
          : "overflow-hidden bg-paper-deep",
        hoverZoom && "group/art",
        wrapperClassName,
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <motion.div
        className={cn(
          "relative",
          fit === "contain" ? "flex max-h-full max-w-full" : "h-full w-full",
        )}
        initial={false}
        animate={{
          clipPath: revealed ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 1.35, ease: EASE.inOutQuint }}
      >
        <Image
          ref={imgRef}
          alt={alt}
          className={cn(
            "transition-[transform,opacity] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            fit === "contain"
              ? "h-auto max-h-full w-auto max-w-full object-contain"
              : "h-full w-full object-cover",
            loaded ? "opacity-100" : "opacity-0",
            hoverZoom && "group-hover/art:scale-[1.035]",
            className,
          )}
          onLoad={() => setLoaded(true)}
          {...props}
        />
      </motion.div>
    </div>
  );
}
