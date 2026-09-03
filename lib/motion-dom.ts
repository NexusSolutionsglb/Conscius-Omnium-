"use client";

import { type ComponentType, type ElementType } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

/**
 * A permissive motion component for a dynamic tag. `motion.div`,
 * `motion.h2`, … are already typed; for anything exotic we fall back to
 * `motion.create()`. Typed as a `motion.div`-shaped component so callers
 * get `className`, `variants`, `whileInView`, `style`, `aria-*`, etc.
 */
export type AnyMotionComponent = ComponentType<
  HTMLMotionProps<"div"> & { className?: string }
>;

const cache = new Map<string, AnyMotionComponent>();

export function m(tag: ElementType): AnyMotionComponent {
  if (typeof tag === "string") {
    const cached = cache.get(tag);
    if (cached) return cached;
    const record = motion as unknown as Record<string, AnyMotionComponent>;
    const created = record[tag] ?? (motion.create(tag) as unknown as AnyMotionComponent);
    cache.set(tag, created);
    return created;
  }
  return motion.create(tag) as unknown as AnyMotionComponent;
}
