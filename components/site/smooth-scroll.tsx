"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/client";

let lenisSingleton: Lenis | null = null;

export function getLenis() {
  return lenisSingleton;
}

/** Scroll the window, whether or not Lenis is driving. */
function scrollTo(target: number | HTMLElement, immediate: boolean) {
  if (lenisSingleton) {
    lenisSingleton.scrollTo(target, { immediate, offset: typeof target === "number" ? 0 : -96 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  } else {
    target.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
  }
}

/**
 * Lenis-driven smooth scrolling for the public site. Respects
 * prefers-reduced-motion (falls back to native scrolling) and pauses via
 * `data-lenis-stop`.
 *
 * Scroll position on navigation follows the browser's own rules:
 *  · a forward navigation starts at the top of the new page,
 *  · a back/forward navigation keeps the position the browser restored,
 *  · a URL carrying a #hash lands on that section (deep links, contents rails).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Set by popstate, consumed by the navigation effect below.
  const restoring = useRef(false);
  const firstRender = useRef(true);

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

  // Remember that the *next* route change came from the back/forward button so
  // the position the browser restored isn't thrown away.
  useEffect(() => {
    const onPop = () => {
      restoring.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      // A deep link with a hash should land on its section, not the top.
      const id = window.location.hash.slice(1);
      if (id) {
        const el = document.getElementById(decodeURIComponent(id));
        if (el) {
          // Wait a frame so fonts and the reveal animations have laid out.
          requestAnimationFrame(() => scrollTo(el, true));
        }
      }
      return;
    }

    if (restoring.current) {
      restoring.current = false;
      return;
    }

    const id = window.location.hash.slice(1);
    if (id) {
      const el = document.getElementById(decodeURIComponent(id));
      if (el) {
        scrollTo(el, false);
        return;
      }
    }

    scrollTo(0, true);
  }, [pathname]);

  return <>{children}</>;
}
