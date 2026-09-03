import "server-only";

import { cache } from "react";
import { pagesSeed } from "@/lib/content";
import type { ManagedPage } from "@/lib/types";
import { fromDbOr } from "./_shared";
import { mapPage } from "./mappers";

export const getPage = cache(
  async (slug: ManagedPage["slug"]): Promise<ManagedPage> => {
    const fallback = () =>
      pagesSeed.find((p) => p.slug === slug) ?? {
        slug,
        title: slug,
        intro: null,
        sections: [],
      };
    return fromDbOr(async (s) => {
      const { data, error } = await s
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapPage(data) : null;
    }, fallback);
  },
);

export const getAllPages = cache(async (): Promise<ManagedPage[]> => {
  return fromDbOr(async (s) => {
    const { data, error } = await s.from("pages").select("*").order("slug");
    if (error) throw error;
    return data?.map(mapPage) ?? null;
  }, () => pagesSeed);
});
