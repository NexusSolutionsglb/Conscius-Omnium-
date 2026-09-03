import "server-only";

import { cache } from "react";
import { collectionsSeed } from "@/lib/content";
import type { Collection } from "@/lib/types";
import { fromAuthedDbOr, fromDbOr } from "./_shared";
import { mapCollection } from "./mappers";

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
