import "server-only";

import { cache } from "react";
import { collectionsSeed } from "@/lib/content";
import type { Collection, Series } from "@/lib/types";
import { fromAuthedDbOr, fromDbOr } from "./_shared";
import { mapCollection } from "./mappers";
import { getPublishedWorks } from "./works";

const publishedSeed = () =>
  collectionsSeed
    .filter((c) => c.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);

export const getCollections = cache(async (): Promise<Collection[]> => {
  return fromDbOr(async (s) => {
    const { data, error } = await s
      .from("collections")
      .select("*")
      .eq("published", true)
      .order("sort_order");
    if (error) throw error;
    return data?.map(mapCollection) ?? null;
  }, publishedSeed);
});

export const getAllCollections = cache(async (): Promise<Collection[]> => {
  return fromAuthedDbOr(async (s) => {
    const { data, error } = await s
      .from("collections")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data?.map(mapCollection) ?? null;
  }, () => [...collectionsSeed].sort((a, b) => a.sortOrder - b.sortOrder));
});

export const getCollectionBySlug = cache(
  async (slug: string): Promise<Collection | null> => {
    const all = await getCollections();
    return all.find((c) => c.slug === slug) ?? null;
  },
);

export const getCollectionSlugs = cache(async (): Promise<string[]> => {
  const all = await getCollections();
  return all.map((c) => c.slug);
});

/**
 * Every published series with its published artworks attached, in gallery
 * order. This is what `/gallery` renders — the flat "all works" wall was
 * replaced by a wall of series, each of which opens into its own hang.
 *
 * Series with no published artwork are dropped: an empty room is not a
 * room the visitor should be able to walk into.
 */
export const getSeriesWithWorks = cache(async (): Promise<Series[]> => {
  const [collections, works] = await Promise.all([
    getCollections(),
    getPublishedWorks(),
  ]);

  return collections
    .map((collection) => {
      const owned = works
        .filter((w) => w.collectionSlug === collection.slug)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return {
        ...collection,
        works: owned,
        plateImage: collection.coverImage || owned[0]?.coverImage || null,
      };
    })
    .filter((s) => s.works.length > 0 || Boolean(s.plateImage));
});

/** One series plus its artworks — the series detail page. */
export const getSeriesBySlug = cache(
  async (slug: string): Promise<Series | null> => {
    const all = await getSeriesWithWorks();
    return all.find((s) => s.slug === slug) ?? null;
  },
);

/**
 * Published works that no series claims. They would otherwise be
 * unreachable once `/gallery` only lists series, so the gallery shows
 * them in a final unnamed row.
 */
export const getUnassignedWorks = cache(async () => {
  const [collections, works] = await Promise.all([
    getCollections(),
    getPublishedWorks(),
  ]);
  const known = new Set(collections.map((c) => c.slug));
  return works.filter((w) => !w.collectionSlug || !known.has(w.collectionSlug));
});
