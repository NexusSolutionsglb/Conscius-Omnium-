"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { prefersReducedMotion } from "@/lib/client";
import { cn } from "@/lib/utils";

/**
 * Vertical parallax on scroll. `amount` is the total travel in pixels
 * across the element's time in the viewport. Keep it small — 20-60px.
 */
export function Parallax({
  children,
  amount = 40,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/** Exposes raw scroll progress for bespoke effects. */
export function useElementScroll(
  offset: [string, string] = ["start end", "end start"],
): { ref: React.RefObject<HTMLDivElement | null>; progress: MotionValue<number> } {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // @ts-expect-error motion offset typing accepts string tuples at runtime
    offset,
  });
  return { ref, progress: scrollYProgress };
}
