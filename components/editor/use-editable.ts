"use client";

import { getPath } from "@/lib/editor/paths";
import { bindToPath } from "@/lib/editor/bind";
import type { EditablePageSlug } from "@/lib/content/defaults";
import { useOptionalEditorStore } from "./editor-store-context";

/**
 * Returns the live editor value at `pages[slug].path` when rendered inside the
 * visual editor, or `fallback` everywhere else (no store on the public site).
 */
export function useEditable<T>(slug: EditablePageSlug, path: string, fallback: T): T {
  const value = useOptionalEditorStore((s) => getPath<T>(s.pages[slug], path));
  return value === undefined ? fallback : value;
}

/** Live value for any `bind` string (`@settings.*`, `@profile.*`, `@works.*`, …). */
export function useEditableBind<T>(bind: string, fallback: T): T {
  const p = bindToPath(bind);
  const value = useOptionalEditorStore((s) => getPath<T>(s, p));
  return value === undefined ? fallback : value;
}

/** Editable slice of site settings (e.g. `contactCopy.heading`). */
export function useEditableSettings<T>(path: string, fallback: T): T {
  const value = useOptionalEditorStore((s) => getPath<T>(s.settings, path));
  return value === undefined ? fallback : value;
}

/** Editable profile field (e.g. `name`, `bio`, `social`). */
export function useEditableProfile<T>(path: string, fallback: T): T {
  const value = useOptionalEditorStore((s) => getPath<T>(s.profile, path));
  return value === undefined ? fallback : value;
}

/** A live DB collection (works / collections / exhibitions / timeline). */
export function useEditableData<T>(
  kind: "collections" | "exhibitions" | "timeline" | "works",
  fallback: T[],
): T[] {
  const value = useOptionalEditorStore((s) => s[kind] as T[] | undefined);
  return value ?? fallback;
}

/** True when rendered inside the visual editor (any mode). */
export function useIsEditing(): boolean {
  return useOptionalEditorStore((s) => s.mode) !== undefined;
}

/** "edit" | "preview" | undefined(not in editor). */
export function useEditorMode(): "edit" | "preview" | undefined {
  return useOptionalEditorStore((s) => s.mode);
}
