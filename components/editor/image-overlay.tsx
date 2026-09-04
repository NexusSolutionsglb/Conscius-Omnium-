"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { ImageDialog } from "./image-dialog";

type ImgTarget = { bind: string; folder: string; wrap: HTMLElement; el: HTMLElement };

function measurable(el: HTMLElement): HTMLElement {
  return getComputedStyle(el).display === "contents"
    ? ((el.firstElementChild as HTMLElement) ?? el)
    : el;
}

function insideRect(el: HTMLElement, x: number, y: number, pad = 44): boolean {
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

function parse(el: HTMLElement): ImgTarget | null {
  const attr = el.dataset.editImage;
  if (!attr) return null;
  const i = attr.lastIndexOf("|");
  return {
    bind: attr.slice(0, i),
    folder: attr.slice(i + 1) || "media",
    wrap: el,
    el: measurable(el),
  };
}

/** Hover affordance + replace dialog for `<EditableImage>` images. */
export function ImageOverlay() {
  const api = useEditorStoreApi();
  const mode = useEditorStore((s) => s.mode);
  const [hover, setHover] = useState<ImgTarget | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [dialog, setDialog] = useState<ImgTarget | null>(null);
  const hoverRef = useRef<ImgTarget | null>(null);
  hoverRef.current = hover;

  useEffect(() => {
    if (mode !== "edit") {
      setHover(null);
      setRect(null);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (!t || t.closest("[data-editor-ui]")) return;
      const el = t.closest<HTMLElement>("[data-edit-image]");
      setHover((prev) => {
        if (el) return parse(el);
        // keep the current target if we're still within its bounds (small gap
        // between the image and the "Replace" button)
        return prev && insideRect(prev.el, e.clientX, e.clientY) ? prev : null;
      });
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, [mode]);

  useEffect(() => {
    if (!hover) {
      setRect(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      if (hoverRef.current?.el) setRect(hoverRef.current.el.getBoundingClientRect());
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [hover]);

  if (mode !== "edit" || !api)
    return dialog ? (
      <ImageDialog bind={dialog.bind} folder={dialog.folder} onClose={() => setDialog(null)} />
    ) : null;

  return (
    <div data-editor-ui="">
      {rect && hover && (
        <>
          <div
            className="co-img-frame"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
          <button
            className="co-img-btn"
            style={{
              top: Math.max(8, rect.top + 8),
              left: Math.min(rect.left + 8, window.innerWidth - 150),
            }}
            onClick={() => setDialog(hover)}
          >
            🖼 Replace image
          </button>
        </>
      )}
      {dialog && (
        <ImageDialog bind={dialog.bind} folder={dialog.folder} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
