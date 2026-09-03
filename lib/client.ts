"use client";

/** Small browser-only helpers shared across client components. */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: none)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

export function canUseCustomCursor(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !prefersReducedMotion()
  );
}

export function lockScroll(locked: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (locked) {
    root.style.setProperty("overflow", "hidden");
    root.classList.add("lenis-stopped");
  } else {
    root.style.removeProperty("overflow");
    root.classList.remove("lenis-stopped");
  }
}
