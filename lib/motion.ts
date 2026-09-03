import type { Transition, Variants } from "motion/react";

/**
 * One animation language for the whole site. Slow, eased, restrained.
 * Animation serves the work — it is never the subject.
 */

export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuint: [0.83, 0, 0.17, 1],
  outSoft: [0.25, 0.46, 0.45, 0.94],
} as const;

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
  image: 1.4,
} as const;

export const transition = {
  base: { duration: DURATION.base, ease: EASE.outExpo } satisfies Transition,
  slow: { duration: DURATION.slow, ease: EASE.outExpo } satisfies Transition,
  image: { duration: DURATION.image, ease: EASE.inOutQuint } satisfies Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transition.base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition.slow },
};

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.outExpo },
  },
};

/** Clip a bottom-anchored wipe — the artwork "develops" into view. */
export const imageClip: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)", scale: 1.06 },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: DURATION.image, ease: EASE.inOutQuint },
  },
};

export const staggerContainer = (stagger = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Line drawing itself in from the left. */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: DURATION.slow, ease: EASE.inOutQuint },
  },
};

export const viewportOnce = { once: true, margin: "0px 0px -12% 0px" } as const;
