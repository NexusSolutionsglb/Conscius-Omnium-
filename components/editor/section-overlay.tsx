"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { pageContentDefaults, type EditablePageSlug } from "@/lib/content/defaults";

type Target =
  | { kind: "section"; slug: EditablePageSlug; key: string; el: HTMLElement }
  | { kind: "item"; slug: EditablePageSlug; path: string; index: number; el: HTMLElement };

const TOOLBAR_H = 34;

/** `data-edit-*` wrappers use `display:contents` and have no box of their own —
 *  measure their first real element child instead. */
function measurable(el: HTMLElement): HTMLElement {
  if (getComputedStyle(el).display === "contents") {
    const child = el.firstElementChild as HTMLElement | null;
    if (child) return child;
  }
  return el;
}

function parse(el: HTMLElement | null): Target | null {
  if (!el) return null;
  const sec = el.dataset.editSection; // "home:disciplines"
  if (sec) {
    const [slug, key] = sec.split(":");
    return { kind: "section", slug: slug as EditablePageSlug, key, el: measurable(el) };
  }
  const item = el.dataset.editItem; // "about:body:2"
  if (item) {
    const [slug, path, idx] = item.split(":");
    return {
      kind: "item",
      slug: slug as EditablePageSlug,
      path,
      index: Number(idx),
      el: measurable(el),
    };
  }
  return null;
}

function selectionId(t: Target): string {
  return t.kind === "section" ? `@section:${t.key}` : `@item:${t.path}:${t.index}`;
}

function findEl(slug: EditablePageSlug, id: string): HTMLElement | null {
  if (id.startsWith("@section:")) {
    return document.querySelector<HTMLElement>(
      `[data-edit-section="${slug}:${id.slice("@section:".length)}"]`,
    );
  }
  if (id.startsWith("@item:")) {
    const rest = id.slice("@item:".length); // "path:index"
    return document.querySelector<HTMLElement>(`[data-edit-item="${slug}:${rest}"]`);
  }
  return null;
}

/** Hover + selection frame and toolbar for editable sections and repeatable items. */
export function SectionOverlay() {
  const api = useEditorStoreApi();
  const mode = useEditorStore((s) => s.mode);
  const selection = useEditorStore((s) => s.selection);
  const [hover, setHover] = useState<Target | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const activeRef = useRef<Target | null>(null);
  const clearTimer = useRef<number>(0);

  // Sticky selection (a section/item that was clicked) wins over hover.
  const sticky: Target | null =
    selection?.kind === "section" && selection.id.startsWith("@")
      ? parse(findEl(selection.slug, selection.id))
      : null;
  const active = sticky ?? hover;
  activeRef.current = active;

  // Follow the active element every frame (it may be animating / scrolling).
  useEffect(() => {
    if (mode !== "edit" || !active) {
      setRect(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = activeRef.current?.el;
      if (el) setRect(el.getBoundingClientRect());
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, active?.el]);

  // Hover tracking, with a grace period so the cursor can travel to the toolbar.
  useEffect(() => {
    if (mode !== "edit") return;
    const asEl = (n: EventTarget | null): HTMLElement | null =>
      n instanceof HTMLElement ? n : null;

    const onMove = (e: MouseEvent) => {
      const target = asEl(e.target);
      window.clearTimeout(clearTimer.current);
      if (target?.closest("[data-editor-ui]")) return; // over the toolbar — keep
      const el = target?.closest<HTMLElement>("[data-edit-section],[data-edit-item]");
      if (el) {
        setHover(parse(el));
      } else {
        clearTimer.current = window.setTimeout(() => setHover(null), 220);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = asEl(e.target);
      if (!target || target.closest("[data-editor-ui]")) return;
      if (target.closest(".co-editable")) return; // editing text — leave it
      const el = target.closest<HTMLElement>("[data-edit-section],[data-edit-item]");
      const t = parse(el);
      if (t && api) {
        api.getState().select({ slug: t.slug, id: selectionId(t), kind: "section" });
      } else if (api) {
        api.getState().select(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && api) api.getState().select(null);
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(clearTimer.current);
    };
  }, [mode, api]);

  if (mode !== "edit" || !rect || !api || !active) return null;
  const t = active;
  const isSelected = !!sticky;

  const st = api.getState();
  const pad = 2;
  const frameStyle: React.CSSProperties = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
  // Prefer just above the section; if that's off-screen (tall / partly scrolled
  // section) pin it to the top of the viewport so it's always reachable.
  let toolbarTop = rect.top - TOOLBAR_H;
  if (toolbarTop < 8) {
    toolbarTop = Math.min(rect.top + 6, rect.bottom - TOOLBAR_H - 6);
  }
  toolbarTop = Math.max(8, Math.min(toolbarTop, window.innerHeight - TOOLBAR_H - 8));
  const toolbarStyle: React.CSSProperties = {
    top: toolbarTop,
    left: Math.max(6, Math.min(rect.left, window.innerWidth - 260)),
  };

  const openInspector = () =>
    api.getState().select({ slug: t.slug, id: selectionId(t), kind: "section" });

  const order: string[] | undefined =
    t.kind === "section" ? (st.pages[t.slug] as { order?: string[] }).order : undefined;
  const canMove = t.kind === "item" || (order?.length ?? 0) > 1;

  const move = (dir: -1 | 1) => {
    if (t.kind === "section") {
      if (!order) return;
      const i = order.indexOf(t.key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      api.getState().reorder(t.slug, "order", i, j);
    } else {
      api.getState().reorder(t.slug, t.path, t.index, t.index + dir);
    }
  };

  const canHide = t.kind === "section" && "hidden" in (st.pages[t.slug] as object);
  const canDelete = t.kind === "item";
  const hasDefault =
    t.kind === "section" &&
    Object.prototype.hasOwnProperty.call(pageContentDefaults[t.slug], t.key);

  return (
    <div data-editor-ui="">
      <div className="co-section-frame" style={frameStyle} data-selected={isSelected || undefined} />
      <div className="co-section-toolbar" style={toolbarStyle}>
        <button title="Move up" disabled={!canMove} onClick={() => move(-1)}>
          ↑
        </button>
        <button title="Move down" disabled={!canMove} onClick={() => move(1)}>
          ↓
        </button>
        <button title="Edit settings" onClick={openInspector}>
          ⚙
        </button>
        {t.kind === "item" && (
          <button
            title="Duplicate"
            onClick={() => api.getState().duplicateItem(t.slug, t.path, t.index)}
          >
            ⧉
          </button>
        )}
        {canHide && (
          <button title="Hide section" onClick={() => api.getState().toggleHidden(t.slug, t.key)}>
            ⊘
          </button>
        )}
        {hasDefault && (
          <button
            title="Restore section to default"
            onClick={() => api.getState().restoreSection(t.slug, t.key)}
          >
            ⟲
          </button>
        )}
        {canDelete && (
          <button
            className="co-danger"
            title="Delete"
            onClick={() => {
              if (confirm("Delete this block?")) api.getState().removeItem(t.slug, t.path, t.index);
            }}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
