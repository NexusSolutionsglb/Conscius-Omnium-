import "server-only";

import { cache } from "react";
import { pagesSeed } from "@/lib/content";
import {
  mergePageContent,
  type EditablePageSlug,
} from "@/lib/content/defaults";
import type { ManagedPage, PageContentMap } from "@/lib/types";
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

type PageContentRow = {
  content: unknown;
  intro: string | null;
  sections: unknown;
};

/**
 * One-time bridge: for about/studio, if `content` has no `body` yet but the
 * legacy `pages.sections` column does (edited via the old Pages admin), fold
 * those into the content shape so no edits are lost on the first render.
 */
function withLegacyBody(slug: EditablePageSlug, row: PageContentRow): unknown {
  const content = (row.content && typeof row.content === "object" ? row.content : {}) as Record<
    string,
    unknown
  >;
  if ((slug !== "about" && slug !== "studio") || Array.isArray(content.body)) return content;
  const legacy = Array.isArray(row.sections) ? row.sections : [];
  if (!legacy.length && row.intro == null) return content;
  return {
    ...content,
    intro: content.intro ?? row.intro ?? undefined,
    body: legacy.map((s) => {
      const sec = s as Record<string, unknown>;
      return {
        id: String(sec.id ?? crypto.randomUUID()),
        eyebrow: String(sec.eyebrow ?? ""),
        heading: String(sec.heading ?? ""),
        body: Array.isArray(sec.body) ? sec.body : [],
        ...(slug === "studio"
          ? {
              image: sec.image ?? null,
              caption: sec.caption ?? null,
              layout: sec.layout === "image-left" ? "image-left" : "image-right",
            }
          : {}),
      };
    }),
  };
}

const loadPageContent = cache(
  async (slug: EditablePageSlug): Promise<PageContentMap[EditablePageSlug]> => {
    return fromDbOr(
      async (s) => {
        const { data, error } = await s
          .from("pages")
          .select("content, intro, sections")
          .eq("slug", slug)
          .maybeSingle<PageContentRow>();
        if (error) throw error;
        // `null` (no row) → fall back; an object (even `{}`) → merge.
        return data ? mergePageContent(slug, withLegacyBody(slug, data)) : null;
      },
      () => mergePageContent(slug, {}),
    );
  },
);

/**
 * Editable page content for the visual editor. Reads `pages.content` and
 * merges it over the bundled defaults, so an unset column (or a partial
 * save) always renders like the original hardcoded copy.
 */
export function getPageContent<S extends EditablePageSlug>(
  slug: S,
): Promise<PageContentMap[S]> {
  return loadPageContent(slug) as Promise<PageContentMap[S]>;
}

export const getHomeContent = () => getPageContent("home");
export const getAboutContent = () => getPageContent("about");
export const getStudioContent = () => getPageContent("studio");
export const getWorkIndexContent = () => getPageContent("work");
export const getExhibitionsContent = () => getPageContent("exhibitions");
export const getContactContent = () => getPageContent("contact");
