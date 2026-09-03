"use client";

import { getPath } from "@/lib/editor/paths";
import type { EditablePageSlug } from "@/lib/content/defaults";
import { useOptionalEditorStore } from "./editor-store-context";

/**
 * Returns the live editor value at `slug.path` when rendered inside the visual
 * editor, or `fallback` (the server/props value) everywhere else. On the public
 * site there is no editor store, so this always returns `fallback` and the
 * component renders exactly as before.
 */
export function useEditable<T>(
  slug: EditablePageSlug,
  path: string,
  fallback: T,
): T {
  const value = useOptionalEditorStore((s) => getPath<T>(s.pages[slug], path));
  return value === undefined ? fallback : value;
}

/** Same, for the editable slice of site settings (e.g. `contactCopy.heading`). */
export function useEditableSettings<T>(path: string, fallback: T): T {
  const value = useOptionalEditorStore((s) => getPath<T>(s.settings, path));
  return value === undefined ? fallback : value;
}

/** True when rendered inside the visual editor (any mode). */
export function useIsEditing(): boolean {
  return useOptionalEditorStore((s) => s.mode) !== undefined;
}

/** "edit" | "preview" | undefined(not in editor). */
export function useEditorMode(): "edit" | "preview" | undefined {
  return useOptionalEditorStore((s) => s.mode);
}
