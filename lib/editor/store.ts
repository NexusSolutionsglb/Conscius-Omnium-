"use client";

import { createStore } from "zustand/vanilla";
import type { PageContentMap } from "@/lib/types";
import {
  pageContentDefaults,
  mergePageContent,
  type EditablePageSlug,
} from "@/lib/content/defaults";
import { getPath, setPath, reorderPath } from "./paths";
import type {
  Device,
  EditorMode,
  EditorSelection,
  EditorSettings,
  EditorSnapshot,
} from "./types";

const DRAFT_KEY = "co-editor-draft-v1";
const HISTORY_LIMIT = 50;

export interface EditorStore extends EditorSnapshot {
  /** Server truth at load — used for dirty checks and "discard". */
  baseline: EditorSnapshot;
  device: Device;
  mode: EditorMode;
  selection: EditorSelection | null;
  dirty: boolean;
  past: EditorSnapshot[];
  future: EditorSnapshot[];

  // lifecycle
  seed: (snapshot: EditorSnapshot) => void;

  // edits
  setValue: (slug: EditablePageSlug, path: string, value: unknown) => void;
  setSettings: (path: string, value: unknown) => void;
  reorder: (slug: EditablePageSlug, path: string, from: number, to: number) => void;
  addItem: (slug: EditablePageSlug, path: string, item: unknown, at?: number) => void;
  removeItem: (slug: EditablePageSlug, path: string, index: number) => void;
  duplicateItem: (slug: EditablePageSlug, path: string, index: number) => void;
  toggleHidden: (slug: EditablePageSlug, key: string) => void;
  restoreSection: (slug: EditablePageSlug, key: string) => void;
  restoreAll: () => void;
  discardDraft: () => void;

  // ui
  setDevice: (d: Device) => void;
  setMode: (m: EditorMode) => void;
  select: (sel: EditorSelection | null) => void;

  // history
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // publish
  markPublished: () => void;
}

const clone = <T>(v: T): T => (typeof structuredClone === "function"
  ? structuredClone(v)
  : JSON.parse(JSON.stringify(v))) as T;

function snapshot(s: EditorSnapshot): EditorSnapshot {
  return { pages: clone(s.pages), settings: clone(s.settings) };
}

function isDirty(cur: EditorSnapshot, base: EditorSnapshot): boolean {
  return JSON.stringify({ p: cur.pages, s: cur.settings }) !==
    JSON.stringify({ p: base.pages, s: base.settings });
}

function readDraft(): EditorSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as EditorSnapshot) : null;
  } catch {
    return null;
  }
}

function writeDraft(s: EditorSnapshot) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ pages: s.pages, settings: s.settings }));
  } catch {
    /* private mode / quota — non-fatal */
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
  const draft = readDraft();
  const startDirty = !!draft && isDirty(draft, base);
  const start: EditorSnapshot = startDirty ? draft! : base;

  return createStore<EditorStore>((set, get) => {
    /** Push current content onto the undo stack, then apply `mutate`. */
    const commit = (mutate: (draft: EditorSnapshot) => EditorSnapshot) => {
      const state = get();
      const before = snapshot(state);
      const after = mutate(before);
      const past = [...state.past, snapshot(state)].slice(-HISTORY_LIMIT);
      const next: EditorSnapshot = { pages: after.pages, settings: after.settings };
      writeDraft(next);
      set({
        pages: next.pages,
        settings: next.settings,
        past,
        future: [],
        dirty: isDirty(next, state.baseline),
      });
    };

    return {
      pages: clone(start.pages),
      settings: clone(start.settings),
      baseline: base,
      device: "desktop",
      mode: "edit",
      selection: null,
      dirty: startDirty,
      past: [],
      future: [],

      seed: (snap) => {
        const draft = readDraft();
        const base = snapshot(snap);
        const useDraft = draft && isDirty(draft, base);
        set({
          pages: useDraft ? draft!.pages : base.pages,
          settings: useDraft ? draft!.settings : base.settings,
          baseline: base,
          past: [],
          future: [],
          dirty: !!useDraft,
        });
      },

      setValue: (slug, path, value) =>
        commit((d) => ({
          ...d,
          pages: { ...d.pages, [slug]: setPath(d.pages[slug], path, value) },
        })),

      setSettings: (path, value) =>
        commit((d) => ({ ...d, settings: setPath(d.settings, path, value) })),

      reorder: (slug, path, from, to) =>
        commit((d) => ({
          ...d,
          pages: { ...d.pages, [slug]: reorderPath(d.pages[slug], path, from, to) },
        })),

      addItem: (slug, path, item, at) =>
        commit((d) => {
          const arr = (getPath<unknown[]>(d.pages[slug], path) ?? []).slice();
          arr.splice(at ?? arr.length, 0, item);
          return { ...d, pages: { ...d.pages, [slug]: setPath(d.pages[slug], path, arr) } };
        }),

      removeItem: (slug, path, index) =>
        commit((d) => {
          const arr = (getPath<unknown[]>(d.pages[slug], path) ?? []).slice();
          arr.splice(index, 1);
          return { ...d, pages: { ...d.pages, [slug]: setPath(d.pages[slug], path, arr) } };
        }),

      duplicateItem: (slug, path, index) =>
        commit((d) => {
          const arr = (getPath<unknown[]>(d.pages[slug], path) ?? []).slice();
          if (index < 0 || index >= arr.length) return d;
          arr.splice(index + 1, 0, clone(arr[index]));
          return { ...d, pages: { ...d.pages, [slug]: setPath(d.pages[slug], path, arr) } };
        }),

      toggleHidden: (slug, key) =>
        commit((d) => {
          const page = d.pages[slug] as { hidden?: string[] };
          const hidden = new Set(page.hidden ?? []);
          if (hidden.has(key)) hidden.delete(key);
          else hidden.add(key);
          return {
            ...d,
            pages: { ...d.pages, [slug]: setPath(d.pages[slug], "hidden", [...hidden]) },
          };
        }),

      restoreSection: (slug, key) =>
        commit((d) => {
          const def = (pageContentDefaults[slug] as unknown as Record<string, unknown>)[key];
          return {
            ...d,
            pages: { ...d.pages, [slug]: setPath(d.pages[slug], key, clone(def)) },
          };
        }),

      restoreAll: () =>
        commit(() => ({
          pages: clone(pageContentDefaults),
          settings: { ...get().baseline.settings, theme: {} },
        })),

      discardDraft: () => {
        const base = get().baseline;
        clearDraft();
        set({
          pages: clone(base.pages),
          settings: clone(base.settings),
          past: [],
          future: [],
          dirty: false,
        });
      },

      setDevice: (device) => set({ device }),
      setMode: (mode) => set({ mode, selection: mode === "preview" ? null : get().selection }),
      select: (selection) => set({ selection }),

      undo: () => {
        const { past, future } = get();
        if (!past.length) return;
        const prev = past[past.length - 1];
        const cur = snapshot(get());
        writeDraft(prev);
        set({
          pages: prev.pages,
          settings: prev.settings,
          past: past.slice(0, -1),
          future: [cur, ...future].slice(0, HISTORY_LIMIT),
          dirty: isDirty(prev, get().baseline),
        });
      },
      redo: () => {
        const { past, future } = get();
        if (!future.length) return;
        const nextSnap = future[0];
        const cur = snapshot(get());
        writeDraft(nextSnap);
        set({
          pages: nextSnap.pages,
          settings: nextSnap.settings,
          past: [...past, cur].slice(-HISTORY_LIMIT),
          future: future.slice(1),
          dirty: isDirty(nextSnap, get().baseline),
        });
      },
      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      markPublished: () => {
        const cur = snapshot(get());
        clearDraft();
        set({ baseline: cur, dirty: false, past: [], future: [] });
      },
    };
  });
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;

/** Build a full working copy from whatever is in the DB right now. */
export function buildSnapshot(
  pages: Partial<Record<EditablePageSlug, unknown>>,
  settings: EditorSettings,
): EditorSnapshot {
  const merged = {} as PageContentMap;
  (Object.keys(pageContentDefaults) as EditablePageSlug[]).forEach((slug) => {
    // @ts-expect-error indexed assignment across the union is safe here
    merged[slug] = mergePageContent(slug, pages[slug] ?? {});
  });
  return { pages: merged, settings };
}
