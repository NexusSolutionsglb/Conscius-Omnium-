/**
 * Dotted-path get / set on plain nested objects, used by the editor store to
 * apply field edits like `setValue("home", "disciplines.heading", "…")`.
 * `set` is immutable — it returns a new object, cloning only along the path.
 */

export function getPath<T = unknown>(obj: unknown, path: string): T | undefined {
  if (!path) return obj as T;
  let cur: unknown = obj;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur as T;
}

export function setPath<T>(obj: T, path: string, value: unknown): T {
  if (!path) return value as T;
  const keys = path.split(".");
  const root: Record<string, unknown> = Array.isArray(obj)
    ? ([...(obj as unknown[])] as unknown as Record<string, unknown>)
    : { ...(obj as Record<string, unknown>) };
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const child = cur[key];
    cur[key] = Array.isArray(child)
      ? [...child]
      : child && typeof child === "object"
        ? { ...(child as Record<string, unknown>) }
        : {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return root as unknown as T;
}

/** Move an item within an array-valued path. Returns a new root object. */
export function reorderPath<T>(obj: T, path: string, from: number, to: number): T {
  const arr = getPath<unknown[]>(obj, path);
  if (!Array.isArray(arr)) return obj;
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return obj;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return setPath(obj, path, next);
}
