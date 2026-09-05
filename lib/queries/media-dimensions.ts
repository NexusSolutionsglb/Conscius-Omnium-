import "server-only";

import { getSupabasePublicClient } from "@/lib/supabase/server";

/**
 * Every upload made through the site's own uploader is recorded in the
 * `media` table with its real intrinsic width/height (see
 * `lib/admin/upload.ts` → `recordMediaUpload`). A `WorkImage` can still end
 * up without that data — a cover image set without ever adding a gallery
 * entry, a row saved before this existed, an older jsonb `images` value —
 * and every consumer then has no choice but to guess a fixed size, which
 * misframes anything that isn't that exact ratio.
 *
 * This looks the real dimensions back up by URL so nothing has to guess.
 * Batched: one query for however many images are missing them, not one
 * query per image.
 */
export async function resolveImageDimensions(
  urls: (string | null | undefined)[],
): Promise<Map<string, { width: number; height: number }>> {
  const map = new Map<string, { width: number; height: number }>();
  const unique = [...new Set(urls.filter((u): u is string => !!u))];
  if (!unique.length) return map;

  const supabase = getSupabasePublicClient();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("media")
    .select("url, width, height")
    .in("url", unique);
  if (error || !data) return map;

  for (const row of data as { url: string; width: number | null; height: number | null }[]) {
    if (row.width && row.height) map.set(row.url, { width: row.width, height: row.height });
  }
  return map;
}
