"use client";

import Link from "next/link";
import type { Series } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { ArtworkGrid } from "./artwork-grid";

/**
 * One series, opened — its artworks in the same grid the main gallery
 * uses for series. Every plate the same size, no borders, generous air.
 */
export function SeriesView({ series }: { series: Series }) {
  if (!series.works.length) {
    return (
      <p className="py-20 text-center text-[0.9rem] text-ink-mute">
        No published work in this series yet.
      </p>
    );
  }

  return (
    <>
      <ArtworkGrid works={series.works} priority />

      <Reveal className="mt-32 border-t border-line pt-12 text-center md:mt-44">
        <p className="text-[0.9rem] text-ink-mute">
          {series.works.length} {series.works.length === 1 ? "work" : "works"} in{" "}
          {series.title}.
        </p>
        <Link
          href="/gallery"
          className="u-link mt-4 inline-block text-[0.6875rem] uppercase tracking-[0.2em]"
        >
          All series
        </Link>
      </Reveal>
    </>
  );
}
