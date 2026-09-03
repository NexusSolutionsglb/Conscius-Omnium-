"use client";

import { createStore } from "zustand/vanilla";
import type { PageContentMap } from "@/lib/types";
import {
  pageContentDefaults,
  mergePageContent,
  type EditablePageSlug,
} from "@/lib/content/defaults";
import { getPath, setPath, reorderPath } from "./paths";
import type { Device, EditorMode, EditorSelection, EditorSnapshot } from "./types";

const DRAFT_KEY = "co-editor-draft-v2";
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
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(pick(s)));
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
  const draft = readDraft();
  const startDirty = !!draft && draftShapeOk(draft) && isDirty(draft, base);
  const start = startDirty ? (draft as EditorSnapshot) : base;

  return createStore<EditorStore>((set, get) => {
    const apply = (next: EditorSnapshot) => {
      const state = get();
      const past = [...state.past, snapshot(pick(state))].slice(-HISTORY_LIMIT);
      writeDraft(next);
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

      seed: (snap) => {
        const b = snapshot(snap);
        const d = readDraft();
        const useDraft = d && draftShapeOk(d) && isDirty(d, b);
        set({
          ...pick(useDraft ? (d as EditorSnapshot) : b),
          baseline: b,
          past: [],
          future: [],
          dirty: !!useDraft,
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
        writeDraft(prev);
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
        writeDraft(nextSnap);
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
