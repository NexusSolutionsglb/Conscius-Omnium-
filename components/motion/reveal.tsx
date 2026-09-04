"use client";

import { type ElementType, type ReactNode } from "react";
import { type Variants } from "motion/react";
import { fadeUp, revealUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { m } from "@/lib/motion-dom";

/** Extra DOM props (e.g. `data-*`, `id`) passed straight through to the element. */
type PassThrough = {
  id?: string;
  [key: `data-${string}`]: string | number | boolean | undefined;
};

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  variant?: "fade-up" | "reveal-up";
} & PassThrough;

/** Scroll-triggered fade + rise. The workhorse reveal. */
export function Reveal({
  children,
  as = "div",
  className,
  delay = 0,
  y,
  once = true,
  variant = "fade-up",
  ...rest
}: RevealProps) {
  const MotionTag = m(as as ElementType);
  const base = variant === "reveal-up" ? revealUp : fadeUp;
  const variants: Variants =
    y !== undefined
      ? {
          hidden: { opacity: 0, y },
          show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay } },
        }
      : {
          hidden: base.hidden,
          show: {
            ...(base.show as object),
            transition: { ...(base.show as { transition?: object })?.transition, delay },
          },
        };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={once ? viewportOnce : { margin: "0px 0px -12% 0px" }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Parent that staggers direct <Reveal>-style children into view. */
export function StaggerList({
  children,
  as = "div",
  className,
  stagger = 0.09,
  delayChildren = 0,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  delayChildren?: number;
} & PassThrough) {
  const MotionTag = m(as as ElementType);
  return (
    <MotionTag
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  as = "div",
  className,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
} & PassThrough) {
  const MotionTag = m(as as ElementType);
  return (
    <MotionTag className={className} variants={fadeUp} {...rest}>
      {children}
    </MotionTag>
  );
}
