"use client";

import type { Work } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StaggerList } from "@/components/motion/reveal";
import { ArtworkPlate } from "./artwork-plate";

/**
 * The gallery grid — the single layout the whole site hangs work in.
 * Same columns, same gutters and the same plate as the series wall on
 * `/gallery`, so moving from the gallery into a series changes what you
 * are looking at and nothing about how you look at it.
 */
export function ArtworkGrid({
  works,
  className,
  priority = false,
}: {
  works: Work[];
  className?: string;
  priority?: boolean;
}) {
  if (!works.length) return null;

  return (
    <StaggerList
      className={cn(
        "grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14",
        className,
      )}
    >
      {works.map((work, i) => (
        <ArtworkPlate key={work.slug} work={work} priority={priority && i < 3} />
      ))}
    </StaggerList>
  );
}
