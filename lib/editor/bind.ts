import type { EditorStoreApi } from "./store";
import { getPath } from "./paths";

/**
 * A `bind` string addresses one editable value. It maps to a full path from the
 * editor-snapshot root:
 *   "home.disciplines.heading"      → pages.home.disciplines.heading
 *   "about.body.2.image"            → pages.about.body.2.image
 *   "@settings.contactCopy.heading" → settings.contactCopy.heading
 *   "@profile.name"                 → profile.name
 *   "@collections.3.title"          → collections.3.title
 *   "@works.5.images.0.url"         → works.5.images.0.url
 */
const AT_SCOPES = ["settings", "profile", "collections", "exhibitions", "timeline", "works"];

export function bindToPath(bind: string): string {
  if (bind.startsWith("@")) {
    const body = bind.slice(1);
    const scope = body.split(".")[0];
    if (AT_SCOPES.includes(scope)) return body; // already snapshot-rooted
  }
  return `pages.${bind}`;
}

export function readBind<T = unknown>(api: EditorStoreApi, bind: string): T | undefined {
  return getPath<T>(api.getState(), bindToPath(bind));
}

export function writeBind(api: EditorStoreApi, bind: string, value: unknown): void {
  api.getState().patch(bindToPath(bind), value);
}
