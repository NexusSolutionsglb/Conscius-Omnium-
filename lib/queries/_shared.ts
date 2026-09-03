import "server-only";

import {
  getSupabasePublicClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";

/**
 * Both factories return a Supabase client over the same `Database`, but
 * from different packages (`@supabase/ssr` vs `@supabase/supabase-js`)
 * so their `SupabaseClient` instantiations aren't nominally identical.
 * This is the shape the query callbacks actually use.
 */
export type ReadClient = NonNullable<
  Awaited<ReturnType<typeof getSupabaseServerClient>>
>;

/**
 * Data-layer contract for the whole site:
 *
 *   1. If Supabase is configured AND the query succeeds AND returns rows,
 *      use the database.
 *   2. Otherwise fall back to the bundled portfolio content.
 *
 * Uses the cookie-free public client so public routes stay ISR-cacheable.
 * RLS still limits reads to published rows.
 */
export async function fromDbOr<T>(
  run: (supabase: ReadClient) => Promise<T | null>,
  fallback: () => T,
): Promise<T> {
  try {
    const supabase = getSupabasePublicClient();
    if (!supabase) return fallback();
    const result = await run(supabase as unknown as ReadClient);
    if (result === null || result === undefined) return fallback();
    if (Array.isArray(result) && result.length === 0) return fallback();
    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[queries] falling back to bundled content:", error);
    }
    return fallback();
  }
}

/**
 * Same contract, but through the cookie-bound (session-aware) client so
 * RLS sees the admin. For the `getAll*` queries used only inside /admin.
 */
export async function fromAuthedDbOr<T>(
  run: (supabase: ReadClient) => Promise<T | null>,
  fallback: () => T,
): Promise<T> {
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return fallback();
    const result = await run(supabase as unknown as ReadClient);
    if (result === null || result === undefined) return fallback();
    if (Array.isArray(result) && result.length === 0) return fallback();
    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[queries] admin read fell back:", error);
    }
    return fallback();
  }
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asObject<T>(value: unknown): Partial<T> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<T>)
    : ({} as Partial<T>);
}
