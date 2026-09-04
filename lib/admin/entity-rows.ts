import type {
  Collection,
  Exhibition,
  Profile,
  TimelineEntry,
  Work,
} from "@/lib/types";
import { normalizeImageUrl } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isRealId = (id: unknown): id is string =>
  typeof id === "string" && UUID_RE.test(id);

/** `index` (array position at publish time) becomes `sort_order` so on-page
 *  drag-reorder persists. Falls back to the entity's own `sortOrder`. */
export function workRow(w: Work, index?: number): Record<string, unknown> {
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    year: w.year ?? null,
    year_sort: w.yearSort ?? null,
    discipline: w.discipline,
    kind: w.kind ?? null,
    medium: w.medium ?? null,
    dimensions: w.dimensions ?? null,
    client: w.client ?? null,
    location: w.location ?? null,
    role: w.role ?? null,
    summary: w.summary ?? "",
    description: w.description ?? [],
    statement: w.statement ?? null,
    concept: w.concept ?? null,
    process: w.process ?? null,
    credits: w.credits ?? [],
    collection_slug: w.collectionSlug ?? null,
    status: w.status,
    availability: w.availability,
    price: w.price ?? null,
    currency: w.currency ?? "INR",
    price_visible: w.priceVisible ?? false,
    featured: w.featured ?? false,
    sort_order: index ?? w.sortOrder ?? 100,
    cover_image: normalizeImageUrl(w.coverImage) || null,
    accent: w.accent ?? null,
    images: (w.images ?? []).map((im, i) => ({
      ...im,
      url: normalizeImageUrl(im.url),
      sortOrder: i,
    })),
    related_slugs: w.relatedSlugs ?? [],
    seo: w.seo ?? {},
    published_at:
      w.status === "published" ? (w.publishedAt ?? new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  };
}

export function collectionRow(c: Collection, index?: number): Record<string, unknown> {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    period: c.period ?? null,
    cover_image: normalizeImageUrl(c.coverImage) || null,
    featured: c.featured ?? false,
    published: c.published ?? true,
    sort_order: index ?? c.sortOrder ?? 100,
    updated_at: new Date().toISOString(),
  };
}

export function exhibitionRow(e: Exhibition, index?: number): Record<string, unknown> {
  return {
    id: e.id,
    title: e.title,
    year: e.year,
    venue: e.venue,
    city: e.city ?? null,
    country: e.country ?? null,
    type: e.type,
    date_label: e.dateLabel ?? null,
    description: e.description ?? null,
    url: e.url ?? null,
    published: e.published ?? true,
    sort_order: index ?? e.sortOrder ?? 100,
    related_slugs: e.relatedSlugs ?? [],
    updated_at: new Date().toISOString(),
  };
}

export function timelineRow(t: TimelineEntry, index?: number): Record<string, unknown> {
  return {
    id: t.id,
    year: t.year,
    title: t.title,
    description: t.description ?? "",
    image: normalizeImageUrl(t.image) || null,
    category: t.category ?? null,
    sort_order: index ?? t.sortOrder ?? 100,
    published: t.published ?? true,
    updated_at: new Date().toISOString(),
  };
}

export function profileRow(p: Profile): Record<string, unknown> {
  return {
    id: "default",
    name: p.name,
    roles: p.roles ?? [],
    headline: p.headline ?? "",
    statement: p.statement ?? "",
    bio: p.bio ?? [],
    education: p.education ?? [],
    email: p.email ?? "",
    phone: p.phone ?? "",
    whatsapp: p.whatsapp ?? "",
    location: p.location ?? "",
    portrait: normalizeImageUrl(p.portrait) || null,
    social: p.social ?? [],
    updated_at: new Date().toISOString(),
  };
}
