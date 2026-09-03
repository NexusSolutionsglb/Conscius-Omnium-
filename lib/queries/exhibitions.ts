import "server-only";

import { cache } from "react";
import { exhibitionsSeed } from "@/lib/content";
import type { Exhibition } from "@/lib/types";
import { fromAuthedDbOr, fromDbOr } from "./_shared";
import { mapExhibition } from "./mappers";

/** Newest year first, then explicit sort order. */
const orderExhibitions = (list: Exhibition[]) =>
  [...list].sort((a, b) => {
    const byYear = Number(b.year) - Number(a.year);
    return byYear !== 0 ? byYear : a.sortOrder - b.sortOrder;
  });

export const getExhibitions = cache(async (): Promise<Exhibition[]> => {
  return fromDbOr(
    async (s) => {
      const { data, error } = await s
        .from("exhibitions")
        .select("*")
        .eq("published", true)
        .order("year", { ascending: false })
        .order("sort_order");
      if (error) throw error;
      return data ? orderExhibitions(data.map(mapExhibition)) : null;
    },
    () => orderExhibitions(exhibitionsSeed.filter((e) => e.published)),
  );
});

export const getAllExhibitions = cache(async (): Promise<Exhibition[]> => {
  return fromAuthedDbOr(
    async (s) => {
      const { data, error } = await s
        .from("exhibitions")
        .select("*")
        .order("year", { ascending: false })
        .order("sort_order");
      if (error) throw error;
      return data ? orderExhibitions(data.map(mapExhibition)) : null;
    },
    () => orderExhibitions(exhibitionsSeed),
  );
});

/** Exhibitions grouped by year for the archive UI. */
export const getExhibitionsByYear = cache(
  async (): Promise<{ year: string; items: Exhibition[] }[]> => {
    const list = await getExhibitions();
    const groups = new Map<string, Exhibition[]>();
    for (const item of list) {
      const bucket = groups.get(item.year) ?? [];
      bucket.push(item);
      groups.set(item.year, bucket);
    }
    return Array.from(groups.entries())
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([year, items]) => ({ year, items }));
  },
);
