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

/* Preview mode: strip every editor affordance. */
:root[data-co-edit="preview"] .co-editable { outline: none !important; background: none !important; cursor: auto; }
`;
