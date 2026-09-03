"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { canUseCustomCursor } from "@/lib/client";

/**
 * Subtle magnetic pull toward the pointer. Used sparingly — the primary
 * CTA, the menu toggle. Disabled on touch / reduced-motion.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.3 });

  const handleMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!canUseCustomCursor()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-flex" }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
