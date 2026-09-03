/**
 * Styles injected into the `?__edit=1` iframe by <EditBridge>. Scoped entirely
 * to `[data-co-edit]` state and editor-only class names / attributes, so it has
 * no effect on the public site (the bridge, and therefore this stylesheet, only
 * mount inside the editor).
 */
export const EDITOR_CSS = `
:root[data-co-edit="edit"] .co-editable {
  outline: 1px dashed transparent;
  outline-offset: 2px;
  transition: outline-color .12s, background-color .12s;
  border-radius: 2px;
  cursor: text;
}
:root[data-co-edit="edit"] .co-editable:hover {
  outline-color: color-mix(in oklab, #2563eb 55%, transparent);
  background-color: color-mix(in oklab, #2563eb 7%, transparent);
}
:root[data-co-edit="edit"] .co-editable:focus {
  outline: 2px solid #2563eb;
  background-color: color-mix(in oklab, #2563eb 6%, transparent);
}

/* Section hover / selection frame (drawn by <SectionOverlay/>). */
.co-section-frame {
  position: fixed;
  pointer-events: none;
  border: 1.5px dashed color-mix(in oklab, #2563eb 55%, transparent);
  border-radius: 3px;
  z-index: 2147482000;
  transition: border-color .1s;
}
.co-section-frame[data-selected="true"] {
  border-style: solid;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb, 0 0 0 4px color-mix(in oklab, #2563eb 18%, transparent);
}
.co-section-toolbar {
  position: fixed;
  display: flex;
  gap: 1px;
  padding: 3px;
  background: #0b1220;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  pointer-events: auto;
  z-index: 2147483600;
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
}
.co-section-toolbar button {
  all: unset;
  display: grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  padding: 0 4px;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.co-section-toolbar button:hover { background: rgba(255,255,255,.16); }
.co-section-toolbar button:active { background: rgba(255,255,255,.28); }
.co-section-toolbar button[disabled] { opacity: .3; cursor: default; }
.co-section-toolbar button[disabled]:hover { background: none; }
.co-section-toolbar .co-danger:hover { background: #dc2626; color: #fff; }
.co-section-toolbar .co-drag { cursor: grab; }
.co-section-toolbar .co-drag:active { cursor: grabbing; }

/* Drag reorder chrome */
.co-drop-line {
  position: fixed;
  height: 3px;
  background: #2563eb;
  border-radius: 2px;
  box-shadow: 0 0 0 3px color-mix(in oklab, #2563eb 25%, transparent);
  z-index: 2147483500;
  pointer-events: none;
}
.co-drag-chip {
  position: fixed;
  padding: 4px 10px;
  background: #0b1220;
  color: #fff;
  font: 500 12px/1.2 system-ui, sans-serif;
  border-radius: 6px;
  z-index: 2147483650;
  pointer-events: none;
  box-shadow: 0 6px 18px rgba(0,0,0,.3);
}

/* ── Image editing ── */
.co-img-frame {
  position: fixed;
  pointer-events: none;
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  background: color-mix(in oklab, #2563eb 8%, transparent);
  z-index: 2147483000;
}
.co-img-btn {
  position: fixed;
  z-index: 2147483200;
  pointer-events: auto;
  background: #0b1220;
  color: #fff;
  border: 0;
  border-radius: 7px;
  padding: 6px 10px;
  font: 500 12px/1 system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,.3);
}
.co-img-btn:hover { background: #1e293b; }

.co-img-dialog-backdrop {
  position: fixed; inset: 0; z-index: 2147483400;
  background: rgba(0,0,0,.4);
  display: grid; place-items: center; padding: 24px;
}
.co-img-dialog {
  width: min(720px, 96vw); max-height: 82vh;
  display: flex; flex-direction: column;
  background: #fff; border-radius: 12px; overflow: hidden;
  font: 400 13px/1.4 system-ui, sans-serif; color: #111827;
}
.co-img-dialog-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding: 10px 12px; border-bottom: 1px solid #e5e7eb;
}
.co-img-dialog .co-tab {
  border: 0; background: none; padding: 5px 10px; border-radius: 6px;
  font-weight: 500; color: #6b7280; cursor: pointer;
}
.co-img-dialog .co-tab-on { background: #111827; color: #fff; }
.co-img-dialog .co-mini {
  border: 1px solid #d1d5db; background: #fff; padding: 5px 10px;
  border-radius: 6px; font-weight: 500; cursor: pointer;
}
.co-img-dialog .co-mini:hover { background: #f9fafb; }
.co-img-dialog .co-mini-danger { color: #dc2626; border-color: #fecaca; }
.co-img-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px; padding: 12px; overflow-y: auto;
}
.co-img-empty { grid-column: 1 / -1; color: #9ca3af; padding: 24px; text-align: center; }
.co-img-cell {
  border: 2px solid transparent; border-radius: 8px; overflow: hidden;
  aspect-ratio: 1; background: #f3f4f6; cursor: pointer; padding: 0;
}
.co-img-cell img { width: 100%; height: 100%; object-fit: cover; display: block; }
.co-img-cell-on { border-color: #2563eb; }
.co-img-url { display: flex; gap: 8px; padding: 16px; }
.co-img-url input {
  flex: 1; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 10px;
}

/* Preview mode: strip every editor affordance. */
:root[data-co-edit="preview"] .co-editable { outline: none !important; background: none !important; cursor: auto; }
`;
