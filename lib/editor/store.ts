"use client";

import { createStore } from "zustand/vanilla";
import type { CustomBlockType, PageContentMap } from "@/lib/types";
import {
  pageContentDefaults,
  mergePageContent,
  type EditablePageSlug,
} from "@/lib/content/defaults";
import { blockId, newBlock } from "./new-entities";
import { getPath, setPath, reorderPath } from "./paths";
import type { Device, EditorMode, EditorSelection, EditorSnapshot } from "./types";

const DRAFT_KEY = "co-editor-draft-v3";
/** Drafts from earlier schemas — cleared on load so they can never be restored
 *  over content that has moved on since. */
const LEGACY_DRAFT_KEYS = ["co-editor-draft", "co-editor-draft-v2"];
const DRAFT_FORMAT = 3;
/** A draft older than this is abandoned rather than merged over live content. */
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const HISTORY_LIMIT = 50;

export interface EditorStore extends EditorSnapshot {
  baseline: EditorSnapshot;
  device: Device;
  mode: EditorMode;
  selection: EditorSelection | null;
  dirty: boolean;
  past: EditorSnapshot[];
  future: EditorSnapshot[];

  seed: (snapshot: EditorSnapshot) => void;

  /* ── generic content ops (path is a full snapshot path) ── */
  patch: (path: string, value: unknown) => void;
  reorderList: (path: string, from: number, to: number) => void;
  insertItem: (path: string, item: unknown, at?: number) => void;
  removeAt: (path: string, index: number) => void;
  duplicateAt: (path: string, index: number) => void;

  /* ── page-content convenience wrappers (kept for existing callers) ── */
  setValue: (slug: EditablePageSlug, path: string, value: unknown) => void;
  setSettings: (path: string, value: unknown) => void;
  setProfile: (path: string, value: unknown) => void;
  reorder: (slug: EditablePageSlug, path: string, from: number, to: number) => void;
  addItem: (slug: EditablePageSlug, path: string, item: unknown, at?: number) => void;
  removeItem: (slug: EditablePageSlug, path: string, index: number) => void;
  duplicateItem: (slug: EditablePageSlug, path: string, index: number) => void;
  toggleHidden: (slug: EditablePageSlug, key: string) => void;
  restoreSection: (slug: EditablePageSlug, key: string) => void;

  /* ── custom section blocks ── */
  addBlock: (slug: EditablePageSlug, type: CustomBlockType, at?: number) => void;
  duplicateSection: (slug: EditablePageSlug, key: string) => void;
  deleteSection: (slug: EditablePageSlug, key: string) => void;

  restoreAll: () => void;
  discardDraft: () => void;

  setDevice: (d: Device) => void;
  setMode: (m: EditorMode) => void;
  select: (sel: EditorSelection | null) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  markPublished: () => void;
}

const clone = <T>(v: T): T =>
  (typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v))) as T;

const SNAPSHOT_KEYS = [
  "pages",
  "settings",
  "profile",
  "collections",
  "exhibitions",
  "timeline",
  "works",
] as const;

function snapshot(s: EditorSnapshot): EditorSnapshot {
  const out = {} as EditorSnapshot;
  for (const k of SNAPSHOT_KEYS) (out as unknown as Record<string, unknown>)[k] = clone(s[k]);
  return out;
}

function pick(s: EditorSnapshot): EditorSnapshot {
  const out = {} as EditorSnapshot;
  for (const k of SNAPSHOT_KEYS) (out as unknown as Record<string, unknown>)[k] = s[k];
  return out;
}

function isDirty(cur: EditorSnapshot, base: EditorSnapshot): boolean {
  return JSON.stringify(pick(cur)) !== JSON.stringify(pick(base));
}

/**
 * The units a draft is diffed and merged by. Anything the admin has not
 * touched is taken from the freshly-loaded server snapshot, so gallery images
 * and other records edited elsewhere (admin panel, SQL, another browser) are
 * never masked by an old local draft. `pages` is split per page so editing
 * one page does not pin the other five to their old copy.
 */
type MergeUnit = string;

function mergeUnits(s: EditorSnapshot): MergeUnit[] {
  const pages = Object.keys(s.pages ?? {}).map((slug) => `pages.${slug}`);
  return [...pages, ...SNAPSHOT_KEYS.filter((k) => k !== "pages")];
}

function unitValue(s: EditorSnapshot, unit: MergeUnit): unknown {
  if (unit.startsWith("pages.")) {
    return (s.pages as unknown as Record<string, unknown>)?.[unit.slice(6)];
  }
  return (s as unknown as Record<string, unknown>)[unit];
}

function setUnitValue(target: EditorSnapshot, unit: MergeUnit, value: unknown) {
  if (unit.startsWith("pages.")) {
    (target.pages as unknown as Record<string, unknown>)[unit.slice(6)] = value;
    return;
  }
  (target as unknown as Record<string, unknown>)[unit] = value;
}

/** The units in which `cur` differs from `base` — i.e. the admin's real edits. */
function touchedUnits(cur: EditorSnapshot, base: EditorSnapshot): MergeUnit[] {
  const units = new Set([...mergeUnits(cur), ...mergeUnits(base)]);
  return [...units].filter(
    (u) => JSON.stringify(unitValue(cur, u)) !== JSON.stringify(unitValue(base, u)),
  );
}

interface StoredDraft {
  v: number;
  savedAt: number;
  /** Units the draft changed relative to the snapshot it was started from. */
  touched: MergeUnit[];
  data: EditorSnapshot;
}

function readStoredDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    LEGACY_DRAFT_KEYS.forEach((k) => window.localStorage.removeItem(k));
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (
      !parsed ||
      parsed.v !== DRAFT_FORMAT ||
      !Array.isArray(parsed.touched) ||
      !draftShapeOk(parsed.data)
    ) {
      clearDraft();
      return null;
    }
    if (!Number.isFinite(parsed.savedAt) || Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) {
      clearDraft();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Rebuild the working state: the live server snapshot, with the draft's
 * touched units laid back over it. Returns `null` when there is nothing to
 * restore, so the editor simply opens on live content.
 */
function restoreDraft(base: EditorSnapshot): EditorSnapshot | null {
  const stored = readStoredDraft();
  if (!stored) return null;
  const touched = stored.touched.filter(
    (u) => JSON.stringify(unitValue(stored.data, u)) !== JSON.stringify(unitValue(base, u)),
  );
  if (!touched.length) {
    clearDraft();
    return null;
  }
  const merged = snapshot(base);
  touched.forEach((u) => setUnitValue(merged, u, clone(unitValue(stored.data, u))));
  return merged;
}

function writeDraft(s: EditorSnapshot, base: EditorSnapshot) {
  try {
    const touched = touchedUnits(s, base);
    if (!touched.length) {
      clearDraft();
      return;
    }
    const payload: StoredDraft = {
      v: DRAFT_FORMAT,
      savedAt: Date.now(),
      touched,
      data: pick(s),
    };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}
function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function createEditorStore(initial: EditorSnapshot) {
  const base = snapshot(initial);
  const restored = restoreDraft(base);
  const startDirty = !!restored;
  const start = restored ?? base;

  return createStore<EditorStore>((set, get) => {
    const apply = (next: EditorSnapshot) => {
      const state = get();
      const past = [...state.past, snapshot(pick(state))].slice(-HISTORY_LIMIT);
      writeDraft(next, state.baseline);
      set({
        ...pick(next),
        past,
        future: [],
        dirty: isDirty(next, state.baseline),
      });
    };
    const commit = (mutate: (d: EditorSnapshot) => EditorSnapshot) =>
      apply(mutate(snapshot(pick(get()))));

    const listAt = (d: EditorSnapshot, path: string): unknown[] =>
      (getPath<unknown[]>(d, path) ?? []).slice();

    return {
      ...pick(snapshot(start)),
      baseline: base,
      device: "desktop",
      mode: "edit",
      selection: null,
      dirty: startDirty,
      past: [],
      future: [],

      /**
       * Adopt a freshly-loaded server snapshot. Units the admin has edited in
       * this session (or in a saved draft) are carried over; everything else
       * — gallery images, works, collections changed anywhere else — is taken
       * from the new snapshot, so the editor never shows stale content.
       */
      seed: (snap) => {
        const b = snapshot(snap);
        const state = get();
        const cur = snapshot(pick(state));
        const merged = snapshot(b);
        // Anything the admin changed since the last seed — the live draft is
        // already folded into `cur`, so this one diff covers both.
        touchedUnits(cur, state.baseline).forEach((u) =>
          setUnitValue(merged, u, clone(unitValue(cur, u))),
        );
        const dirty = isDirty(merged, b);
        if (dirty) writeDraft(merged, b);
        else clearDraft();
        set({
          ...pick(merged),
          baseline: b,
          past: [],
          future: [],
          dirty,
        });
      },

      patch: (path, value) => commit((d) => setPath(d, path, value)),
      reorderList: (path, from, to) => commit((d) => reorderPath(d, path, from, to)),
      insertItem: (path, item, at) =>
        commit((d) => {
          const arr = listAt(d, path);
          arr.splice(at ?? arr.length, 0, item);
          return setPath(d, path, arr);
        }),
      removeAt: (path, index) =>
        commit((d) => {
          const arr = listAt(d, path);
          arr.splice(index, 1);
          return setPath(d, path, arr);
        }),
      duplicateAt: (path, index) =>
        commit((d) => {
          const arr = listAt(d, path);
          if (index < 0 || index >= arr.length) return d;
          arr.splice(index + 1, 0, clone(arr[index]));
          return setPath(d, path, arr);
        }),

      /* wrappers */
      setValue: (slug, path, value) => get().patch(`pages.${slug}.${path}`, value),
      setSettings: (path, value) => get().patch(`settings.${path}`, value),
      setProfile: (path, value) => get().patch(`profile.${path}`, value),
      reorder: (slug, path, from, to) =>
        get().reorderList(`pages.${slug}.${path}`, from, to),
      addItem: (slug, path, item, at) => get().insertItem(`pages.${slug}.${path}`, item, at),
      removeItem: (slug, path, index) => get().removeAt(`pages.${slug}.${path}`, index),
      duplicateItem: (slug, path, index) =>
        get().duplicateAt(`pages.${slug}.${path}`, index),

      toggleHidden: (slug, key) =>
        commit((d) => {
          const page = d.pages[slug] as { hidden?: string[] };
          const hidden = new Set(page.hidden ?? []);
          if (hidden.has(key)) hidden.delete(key);
          else hidden.add(key);
          return setPath(d, `pages.${slug}.hidden`, [...hidden]);
        }),

      restoreSection: (slug, key) =>
        commit((d) => {
          const def = (pageContentDefaults[slug] as unknown as Record<string, unknown>)[key];
          return setPath(d, `pages.${slug}.${key}`, clone(def));
        }),

      addBlock: (slug, type, at) =>
        commit((d) => {
          const page = d.pages[slug] as {
            order: string[];
            blocks?: Record<string, unknown>;
          };
          const id = blockId();
          const order = [...(page.order ?? [])];
          order.splice(at ?? order.length, 0, `block:${id}`);
          let next = setPath(d, `pages.${slug}.order`, order);
          next = setPath(next, `pages.${slug}.blocks.${id}`, newBlock(type));
          return next;
        }),

      duplicateSection: (slug, key) =>
        commit((d) => {
          const page = d.pages[slug] as {
            order: string[];
            blocks?: Record<string, unknown>;
          };
          const order = [...(page.order ?? [])];
          const i = order.indexOf(key);
          if (i < 0) return d;
          if (key.startsWith("block:")) {
            const srcId = key.slice(6);
            const src = (page.blocks ?? {})[srcId];
            if (src == null) return d;
            const id = blockId();
            order.splice(i + 1, 0, `block:${id}`);
            let next = setPath(d, `pages.${slug}.order`, order);
            next = setPath(next, `pages.${slug}.blocks.${id}`, clone(src));
            return next;
          }
          // Fixed section: duplicating just repeats it in the order.
          order.splice(i + 1, 0, key);
          return setPath(d, `pages.${slug}.order`, order);
        }),

      deleteSection: (slug, key) =>
        commit((d) => {
          const page = d.pages[slug] as {
            order: string[];
            hidden?: string[];
            blocks?: Record<string, unknown>;
            sectionStyles?: Record<string, unknown>;
          };
          const order = [...(page.order ?? [])];
          const at = order.indexOf(key);
          if (at >= 0) order.splice(at, 1);
          let next = setPath(d, `pages.${slug}.order`, order);
          next = setPath(
            next,
            `pages.${slug}.hidden`,
            (page.hidden ?? []).filter((k) => k !== key),
          );
          if (key.startsWith("block:")) {
            const id = key.slice(6);
            const blocks = { ...(page.blocks ?? {}) };
            delete blocks[id];
            next = setPath(next, `pages.${slug}.blocks`, blocks);
          }
          if (page.sectionStyles?.[key]) {
            const styles = { ...page.sectionStyles };
            delete styles[key];
            next = setPath(next, `pages.${slug}.sectionStyles`, styles);
          }
          return next;
        }),

      restoreAll: () =>
        commit((d) => ({
          ...d,
          pages: clone(pageContentDefaults),
          settings: { ...d.settings, theme: {} },
        })),

      discardDraft: () => {
        clearDraft();
        set({
          ...pick(snapshot(get().baseline)),
          past: [],
          future: [],
          dirty: false,
        });
      },

      setDevice: (device) => set({ device }),
      setMode: (mode) =>
        set({ mode, selection: mode === "preview" ? null : get().selection }),
      select: (selection) => set({ selection }),

      undo: () => {
        const { past } = get();
        if (!past.length) return;
        const prev = past[past.length - 1];
        writeDraft(prev, get().baseline);
        set({
          ...pick(prev),
          past: past.slice(0, -1),
          future: [snapshot(pick(get())), ...get().future].slice(0, HISTORY_LIMIT),
          dirty: isDirty(prev, get().baseline),
        });
      },
      redo: () => {
        const { future } = get();
        if (!future.length) return;
        const nextSnap = future[0];
        writeDraft(nextSnap, get().baseline);
        set({
          ...pick(nextSnap),
          past: [...get().past, snapshot(pick(get()))].slice(-HISTORY_LIMIT),
          future: future.slice(1),
          dirty: isDirty(nextSnap, get().baseline),
        });
      },
      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      markPublished: () => {
        const cur = snapshot(pick(get()));
        clearDraft();
        set({ baseline: cur, dirty: false, past: [], future: [] });
      },
    };
  });
}

/** A draft from an older schema (missing keys) is discarded rather than merged. */
function draftShapeOk(d: unknown): d is EditorSnapshot {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return SNAPSHOT_KEYS.every((k) => k in o);
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;

export function buildSnapshot(
  pages: Partial<Record<EditablePageSlug, unknown>>,
  rest: Omit<EditorSnapshot, "pages">,
): EditorSnapshot {
  const merged = {} as PageContentMap;
  (Object.keys(pageContentDefaults) as EditablePageSlug[]).forEach((slug) => {
    // @ts-expect-error indexed assignment across the union is safe here
    merged[slug] = mergePageContent(slug, pages[slug] ?? {});
  });
  return { pages: merged, ...rest };
}
