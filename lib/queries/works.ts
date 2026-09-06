import "server-only";

import { cache } from "react";
import { worksSeed } from "@/lib/content";
import type { Discipline, Work } from "@/lib/types";
import { fromAuthedDbOr, fromDbOr, type ReadClient } from "./_shared";
import { mapWork } from "./mappers";
import { resolveImageDimensions } from "./media-dimensions";
import type { WorkRow } from "@/lib/supabase/database.types";

const bySort = (a: Work, b: Work) => a.sortOrder - b.sortOrder;
const publishedSeed = () =>
  worksSeed.filter((w) => w.status === "published").sort(bySort);

async function fetchWorkRows(
  supabase: ReadClient,
  opts: { includeUnpublished?: boolean } = {},
) {
  let query = supabase.from("works").select("*").order("sort_order");
  if (!opts.includeUnpublished) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  if (!data) return null;
  const works = (data as unknown as WorkRow[]).map((row) => mapWork(row));
  return backfillImageDimensions(works);
}

/**
 * Fill in any `WorkImage` missing width/height from the media library, so
 * the gallery cards, hero viewer and lightbox always frame the image by its
 * real proportions instead of a guessed fallback ratio.
 */
async function backfillImageDimensions(works: Work[]): Promise<Work[]> {
  const missingUrls = works.flatMap((w) =>
    w.images.filter((im) => !im.width || !im.height).map((im) => im.url),
  );
  if (!missingUrls.length) return works;

  const dims = await resolveImageDimensions(missingUrls);
  if (!dims.size) return works;

  return works.map((w) => ({
    ...w,
    images: w.images.map((im) => {
      if (im.width && im.height) return im;
      const found = dims.get(im.url);
      return found ? { ...im, ...found } : im;
    }),
  }));
}

/** All published works, portfolio order. */
export const getPublishedWorks = cache(async (): Promise<Work[]> => {
  return fromDbOr((s) => fetchWorkRows(s), publishedSeed);
});

/** Every work regardless of status — Admin only. */
export const getAllWorks = cache(async (): Promise<Work[]> => {
  return fromAuthedDbOr(
    (s) => fetchWorkRows(s, { includeUnpublished: true }),
    () => [...worksSeed].sort(bySort),
  );
});

export const getFeaturedWorks = cache(async (limit = 6): Promise<Work[]> => {
  const works = await getPublishedWorks();
  const featured = works.filter((w) => w.featured);
  return (featured.length ? featured : works).slice(0, limit);
});

export const getWorkBySlug = cache(
  async (slug: string, opts: { includeUnpublished?: boolean } = {}): Promise<Work | null> => {
    const source = opts.includeUnpublished
      ? await getAllWorks()
      : await getPublishedWorks();
    return source.find((w) => w.slug === slug) ?? null;
  },
);

export const getWorksByCollection = cache(
  async (collectionSlug: string): Promise<Work[]> => {
    const works = await getPublishedWorks();
    return works.filter((w) => w.collectionSlug === collectionSlug);
  },
);

export const getWorksByDiscipline = cache(
  async (discipline: Discipline): Promise<Work[]> => {
    const works = await getPublishedWorks();
    return works.filter((w) => w.discipline === discipline);
  },
);

/**
 * Related works: explicit `relatedSlugs` first, then filled out by
 * collection / discipline / adjacency until `limit` is reached.
 */
export const getRelatedWorks = cache(
  async (slug: string, limit = 3): Promise<Work[]> => {
    const works = await getPublishedWorks();
    const current = works.find((w) => w.slug === slug);
    if (!current) return [];

    const pool = new Map<string, Work>();
    const add = (w?: Work) => {
      if (w && w.slug !== slug && !pool.has(w.slug)) pool.set(w.slug, w);
    };

    (current.relatedSlugs ?? []).forEach((s) =>
      add(works.find((w) => w.slug === s)),
    );
    works
      .filter((w) => current.collectionSlug && w.collectionSlug === current.collectionSlug)
      .forEach(add);
    works.filter((w) => w.discipline === current.discipline).forEach(add);

    return Array.from(pool.values()).slice(0, limit);
  },
);

/**
 * Previous / next, wrapping. A work that belongs to a series steps through
 * *that series* — the visitor arrived from a series and should be able to
 * walk it end to end without leaving it. Everything else falls back to
 * portfolio order.
 */
export const getAdjacentWorks = cache(
  async (slug: string): Promise<{ prev: Work | null; next: Work | null }> => {
    const all = await getPublishedWorks();
    const current = all.find((w) => w.slug === slug);
    if (!current) return { prev: null, next: null };

    const scope = current.collectionSlug
      ? all.filter((w) => w.collectionSlug === current.collectionSlug)
      : all;
    const works = scope.length > 1 ? scope : all;

    const index = works.findIndex((w) => w.slug === slug);
    if (index === -1) return { prev: null, next: null };
    return {
      prev: works[(index - 1 + works.length) % works.length] ?? null,
      next: works[(index + 1) % works.length] ?? null,
    };
  },
);

export const getAllWorkSlugs = cache(async (): Promise<string[]> => {
  const works = await getPublishedWorks();
  return works.map((w) => w.slug);
});
