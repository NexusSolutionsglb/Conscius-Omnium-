"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DragInfo = { active: boolean; label: string; x: number; y: number };
export type DropHint = { rect: DOMRect; before: boolean } | null;

const measurable = (el: HTMLElement) =>
  getComputedStyle(el).display === "contents"
    ? ((el.firstElementChild as HTMLElement) ?? el)
    : el;

/**
 * Pointer-based drag reorder that works with `display:contents` wrappers.
 * Listeners are attached synchronously in `start()` (not via an effect) so a
 * very fast drag can't slip between the pointerdown and the listener setup.
 */
export function useDragReorder(
  onDrop: (fromEl: HTMLElement, targetEl: HTMLElement, before: boolean) => void,
) {
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const [hint, setHint] = useState<DropHint>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const start = useCallback(
    (
      e: React.PointerEvent,
      opts: { label: string; selector: string; fromEl: HTMLElement },
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const { label, selector, fromEl } = opts;
      let target: { el: HTMLElement; before: boolean } | null = null;

      setDrag({ active: true, label, x: e.clientX, y: e.clientY });
      document.documentElement.style.userSelect = "none";
      document.documentElement.style.cursor = "grabbing";

      const onMove = (ev: PointerEvent) => {
        setDrag({ active: true, label, x: ev.clientX, y: ev.clientY });
        const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
        let best: { el: HTMLElement; rect: DOMRect; before: boolean } | null = null;
        let bestDist = Infinity;
        for (const wrap of els) {
          const el = measurable(wrap);
          const r = el.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          const d = Math.abs(ev.clientY - mid);
          if (d < bestDist) {
            bestDist = d;
            best = { el: wrap, rect: r, before: ev.clientY < mid };
          }
        }
        if (best) {
          target = { el: best.el, before: best.before };
          setHint({ rect: best.rect, before: best.before });
        } else {
          target = null;
          setHint(null);
        }
      };

      const finish = () => {
        cleanup();
        if (target && target.el !== fromEl) onDrop(fromEl, target.el, target.before);
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        document.documentElement.style.userSelect = "";
        document.documentElement.style.cursor = "";
        cleanupRef.current = null;
        setDrag(null);
        setHint(null);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
      cleanupRef.current = cleanup;
    },
    [onDrop],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return { start, drag, hint };
}
