"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore, useEditorStoreApi } from "./editor-store-context";
import { useDragReorder } from "@/lib/editor/use-drag-reorder";
import { pageContentDefaults, type EditablePageSlug } from "@/lib/content/defaults";

type Meta = { schema?: string; bind?: string; label?: string };

type Target =
  | ({ kind: "section"; slug: EditablePageSlug; key: string; el: HTMLElement } & Meta)
  | ({
      kind: "item";
      slug: EditablePageSlug;
      path: string;
      index: number;
      /** full snapshot path of the array this item lives in */
      listPath: string;
      el: HTMLElement;
    } & Meta)
  | {
      kind: "node";
      slug: EditablePageSlug;
      bind: string;
      schema?: string;
      label?: string;
      el: HTMLElement;
    };

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

function meta(el: HTMLElement): Meta {
  return {
    schema: el.dataset.editKind || undefined,
    bind: el.dataset.editBind || undefined,
    label: el.dataset.editLabel || undefined,
  };
}

function parse(el: HTMLElement | null): Target | null {
  if (!el) return null;
  const sec = el.dataset.editSection; // "home:disciplines" | "home:block:b1a2"
  if (sec) {
    const i = sec.indexOf(":");
    const slug = sec.slice(0, i);
    const key = sec.slice(i + 1);
    return { kind: "section", slug: slug as EditablePageSlug, key, el: measurable(el), ...meta(el) };
  }
  const item = el.dataset.editItem; // "about:body:2"
  if (item) {
    const [slug, path, idx] = item.split(":");
    return {
      kind: "item",
      slug: slug as EditablePageSlug,
      path,
      index: Number(idx),
      listPath: el.dataset.editList ?? `pages.${slug}.${path}`,
      el: measurable(el),
      ...meta(el),
    };
  }
  const node = el.dataset.editNode; // "home" (slug) — inspector-only block
  if (node) {
    return {
      kind: "node",
      slug: (node || "home") as EditablePageSlug,
      bind: el.dataset.editBind ?? "",
      schema: el.dataset.editKind || undefined,
      label: el.dataset.editLabel || undefined,
      el: measurable(el),
    };
  }
  return null;
}

function selectionId(t: Target): string {
  if (t.kind === "section") return `@section:${t.key}`;
  if (t.kind === "item") return `@item:${t.path}:${t.index}`;
  return `@node:${t.bind}`;
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
  if (id.startsWith("@node:")) {
    const bind = id.slice("@node:".length);
    return document.querySelector<HTMLElement>(`[data-edit-node][data-edit-bind="${bind}"]`);
  }
  return null;
}

const CSS = (t: Target) => ({
  slug: t.slug,
  id: selectionId(t),
  kind: "section" as const,
  schema: "schema" in t ? t.schema : undefined,
  bind: "bind" in t ? t.bind : undefined,
  label: "label" in t ? t.label : undefined,
});

/** Hover + selection frame and toolbar for editable sections and repeatable items. */
export function SectionOverlay() {
  const api = useEditorStoreApi();
  const mode = useEditorStore((s) => s.mode);
  const selection = useEditorStore((s) => s.selection);
  const [hover, setHover] = useState<Target | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const activeRef = useRef<Target | null>(null);
  const clearTimer = useRef<number>(0);

  // Sticky selection (a section/item/node that was clicked) wins over hover.
  const sticky: Target | null =
    selection?.kind === "section" && selection.id.startsWith("@")
      ? parse(findEl(selection.slug, selection.id))
      : null;
  const active = sticky ?? hover;
  activeRef.current = active;
  const draggingRef = useRef(false);

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
      if (draggingRef.current) return;
      const target = asEl(e.target);
      window.clearTimeout(clearTimer.current);
      if (target?.closest("[data-editor-ui]")) return; // over the toolbar — keep
      const el = target?.closest<HTMLElement>(
        "[data-edit-section],[data-edit-item],[data-edit-node]",
      );
      if (el) {
        setHover(parse(el));
      } else {
        clearTimer.current = window.setTimeout(() => setHover(null), 220);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = asEl(e.target);
      if (draggingRef.current) return;
      if (!target || target.closest("[data-editor-ui]")) return;
      if (target.closest(".co-editable")) return; // editing text — leave it
      const el = target.closest<HTMLElement>(
        "[data-edit-section],[data-edit-item],[data-edit-node]",
      );
      const t = parse(el);
      if (t && api) {
        api.getState().select(CSS(t));
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

  // ── drag reorder ──────────────────────────────────────────────
  const onDrop = useCallback(
    (fromEl: HTMLElement, targetEl: HTMLElement, before: boolean) => {
      if (!api) return;
      const from = parse(fromEl);
      const target = parse(targetEl);
      if (!from || !target) return;

      if (from.kind === "section" && target.kind === "section" && from.slug === target.slug) {
        const page = api.getState().pages[from.slug] as { order?: string[] };
        const order = [...(page.order ?? [])];
        const fi = order.indexOf(from.key);
        let ti = order.indexOf(target.key);
        if (fi < 0 || ti < 0) return;
        order.splice(fi, 1);
        if (fi < ti) ti -= 1;
        order.splice(before ? ti : ti + 1, 0, from.key);
        api.getState().setValue(from.slug, "order", order);
      } else if (
        from.kind === "item" &&
        target.kind === "item" &&
        from.listPath === target.listPath
      ) {
        let insertAt = before ? target.index : target.index + 1;
        if (from.index < insertAt) insertAt -= 1;
        if (insertAt !== from.index) {
          api.getState().reorderList(from.listPath, from.index, insertAt);
        }
      }
    },
    [api],
  );
  const { start: startDrag, drag, hint } = useDragReorder(onDrop);
  draggingRef.current = !!drag;

  if (mode !== "edit" || !rect || !api || !active) {
    return drag ? <DragChrome drag={drag} hint={hint} /> : null;
  }
  const t = active;
  const isSelected = !!sticky;
  const wrapEl = findEl(t.slug, selectionId(t));
  const dragSelector =
    t.kind === "section"
      ? `[data-edit-section^="${t.slug}:"]`
      : t.kind === "item"
        ? `[data-edit-item^="${t.slug}:${t.path}:"]`
        : "";

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

  const openInspector = () => api.getState().select(CSS(t));

  const order: string[] | undefined =
    t.kind === "section" ? (st.pages[t.slug] as { order?: string[] }).order : undefined;
  const canMove = t.kind === "item" || (t.kind === "section" && (order?.length ?? 0) > 1);

  const move = (dir: -1 | 1) => {
    if (t.kind === "section") {
      if (!order) return;
      const i = order.indexOf(t.key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      api.getState().reorder(t.slug, "order", i, j);
    } else if (t.kind === "item") {
      api.getState().reorderList(t.listPath, t.index, t.index + dir);
    }
  };

  const canHide = t.kind === "section" && "hidden" in (st.pages[t.slug] as object);
  const isBlock = t.kind === "section" && t.key.startsWith("block:");
  const canDelete = t.kind === "item" || t.kind === "section";
  const canDuplicate = t.kind === "item" || t.kind === "section";
  const hasDefault =
    t.kind === "section" &&
    Object.prototype.hasOwnProperty.call(pageContentDefaults[t.slug], t.key);
  const hasInspector = t.kind === "node" || t.kind === "item" || t.kind === "section";

  const duplicate = () => {
    if (t.kind === "item") api.getState().duplicateAt(t.listPath, t.index);
    else if (t.kind === "section") api.getState().duplicateSection(t.slug, t.key);
  };
  const remove = () => {
    if (t.kind === "item") {
      if (confirm("Delete this block?")) api.getState().removeAt(t.listPath, t.index);
    } else if (t.kind === "section") {
      const msg = isBlock
        ? "Delete this section?"
        : "Remove this section? “Restore defaults” brings it back.";
      if (confirm(msg)) api.getState().deleteSection(t.slug, t.key);
    }
  };

  return (
    <div data-editor-ui="">
      <div className="co-section-frame" style={frameStyle} data-selected={isSelected || undefined} />
      <DragChrome drag={drag} hint={hint} />
      <div className="co-section-toolbar" style={toolbarStyle}>
        {(t.kind === "section" || t.kind === "item") && (
          <button
            title="Drag to reorder"
            className="co-drag"
            disabled={!canMove}
            onPointerDown={(e) => {
              if (!canMove || !wrapEl) return;
              startDrag(e, {
                label:
                  t.kind === "section" ? sectionLabel(t.key) : t.label || `Block ${t.index + 1}`,
                selector: dragSelector,
                fromEl: wrapEl,
              });
            }}
          >
            ⠿
          </button>
        )}
        {(t.kind === "section" || t.kind === "item") && (
          <>
            <button title="Move up" disabled={!canMove} onClick={() => move(-1)}>
              ↑
            </button>
            <button title="Move down" disabled={!canMove} onClick={() => move(1)}>
              ↓
            </button>
          </>
        )}
        {hasInspector && (
          <button title="Edit settings" onClick={openInspector}>
            ⚙
          </button>
        )}
        {canDuplicate && (
          <button title="Duplicate" onClick={duplicate}>
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
          <button className="co-danger" title="Delete" onClick={remove}>
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  intro: "Intro",
  featured: "Featured work",
  disciplines: "Disciplines",
  timeline: "Timeline strip",
  studioPreview: "Studio preview",
  collections: "Collections rail",
  contactCta: "Contact CTA",
};
function sectionLabel(key: string) {
  return SECTION_LABELS[key] ?? key;
}

/** The floating "Moving: X" chip and the blue drop-indicator line. */
function DragChrome({
  drag,
  hint,
}: {
  drag: { label: string; x: number; y: number } | null;
  hint: { rect: DOMRect; before: boolean } | null;
}) {
  if (!drag) return null;
  return (
    <div data-editor-ui="">
      {hint && (
        <div
          className="co-drop-line"
          style={{
            top: (hint.before ? hint.rect.top : hint.rect.bottom) - 1.5,
            left: hint.rect.left,
            width: hint.rect.width,
          }}
        />
      )}
      <div className="co-drag-chip" style={{ top: drag.y + 14, left: drag.x + 14 }}>
        ⠿ {drag.label}
      </div>
    </div>
  );
}
