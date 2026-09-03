"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/client";

let lenisSingleton: Lenis | null = null;

export function getLenis() {
  return lenisSingleton;
}

/**
 * Lenis-driven smooth scrolling for the public site. Respects
 * prefers-reduced-motion (falls back to native), pauses via
 * `data-lenis-stop`, and resets to top on route change.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
      lerp: 0.11,
    });
    lenisSingleton = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisSingleton = null;
    };
  }, []);

  useEffect(() => {
    if (lenisSingleton) {
      lenisSingleton.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
