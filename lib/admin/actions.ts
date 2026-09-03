"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";
import {
  collectionSchema,
  exhibitionSchema,
  profileSchema,
  settingsSchema,
  timelineSchema,
  workSchema,
} from "@/lib/validations/work";
import { inquiryStatusSchema } from "@/lib/validations/inquiry";
import { slugify, toParagraphs, normalizeImageUrl } from "@/lib/utils";
import type { WorkImage } from "@/lib/types";
import {
  isRealId,
  workRow,
  collectionRow,
  exhibitionRow,
  timelineRow,
  profileRow,
} from "./entity-rows";

export type ActionResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function db() {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function fail(e: z.ZodError): ActionResult {
  return {
    ok: false,
    error: "Please check the highlighted fields.",
    fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
  };
}

function revalidateSite(...paths: string[]) {
  ["/", "/work", "/about", "/studio", "/exhibitions", ...paths].forEach((p) =>
    revalidatePath(p),
  );
}

/* ───────────────────────── auth ───────────────────────── */

export async function adminSignOut() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

/* ───────────────────────── works ──────────────────────── */

const splitList = (v: string) =>
  v
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

export async function saveWork(
  existingId: string | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = workSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;

  const supabase = await db();

  // Preserve the images array (managed by a separate action).
  let images: WorkImage[] = [];
  if (existingId) {
    const { data } = await supabase
      .from("works")
      .select("images")
      .eq("id", existingId)
      .maybeSingle<{ images: unknown }>();
    images = Array.isArray(data?.images) ? (data.images as WorkImage[]) : [];
  }
  if (raw.imagesJson) {
    try {
      images = JSON.parse(raw.imagesJson) as WorkImage[];
    } catch {
      /* keep existing */
    }
  }
  images = images.map((im) => ({ ...im, url: normalizeImageUrl(im.url) }));

  const row = {
    slug: v.slug || slugify(v.title),
    title: v.title,
    year: v.year,
    year_sort: v.yearSort ?? null,
    discipline: v.discipline,
    kind: v.kind,
    medium: v.medium,
    dimensions: v.dimensions,
    client: v.client,
    location: v.location,
    role: v.role,
    summary: v.summary,
    description: toParagraphs(v.description),
    statement: v.statement,
    concept: v.concept,
    process: v.process,
    collection_slug: v.collectionSlug,
    status: v.status,
    availability: v.availability,
    price: v.price ?? null,
    currency: v.currency,
    price_visible: v.priceVisible,
    featured: v.featured,
    sort_order: v.sortOrder,
    cover_image: normalizeImageUrl(v.coverImage) || null,
    accent: v.accent ? (v.accent.startsWith("#") ? v.accent : `#${v.accent}`) : null,
    images,
    related_slugs: splitList(v.relatedSlugs ?? ""),
    seo: {
      title: v.seoTitle ?? null,
      description: v.seoDescription ?? null,
      ogImage: normalizeImageUrl(v.ogImage) || null,
    },
    published_at:
      v.status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (existingId) {
    const { error } = await supabase.from("works").update(row as never).eq("id", existingId);
    if (error) return { ok: false, error: error.message };
    revalidateSite(`/work/${row.slug}`);
    return { ok: true, message: "Saved", id: existingId };
  }

  const { data, error } = await supabase
    .from("works")
    .insert(row as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return { ok: false, error: error.message };
  revalidateSite(`/work/${row.slug}`);
  return { ok: true, message: "Created", id: data?.id };
}

export async function updateWorkImages(
  workId: string,
  images: WorkImage[],
): Promise<ActionResult> {
  const supabase = await db();
  images = images.map((im) => ({ ...im, url: normalizeImageUrl(im.url) }));
  const cover = images.find((i) => i.kind === "cover") ?? images[0];
  const { data, error } = await supabase
    .from("works")
    .update({
      images,
      ...(cover ? { cover_image: cover.url } : {}),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", workId)
    .select("slug")
    .maybeSingle<{ slug: string }>();
  if (error) return { ok: false, error: error.message };
  // The work detail page is ISR-cached (revalidate = 3600), so it must be
  // purged explicitly or edits won't show until the hour is up.
  revalidateSite(...(data?.slug ? [`/work/${data.slug}`] : []));
  return { ok: true, message: "Images updated" };
}

export async function setWorkStatus(
  id: string,
  status: "draft" | "published" | "archived",
): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase
    .from("works")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true, message: `Marked ${status}` };
}

export async function toggleWorkFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase
    .from("works")
    .update({ featured, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function duplicateWork(id: string): Promise<ActionResult> {
  const supabase = await db();
  const { data, error } = await supabase.from("works").select("*").eq("id", id).maybeSingle();
  if (error || !data) return { ok: false, error: error?.message ?? "Not found" };
  const { id: _drop, created_at: _c, updated_at: _u, ...rest } = data as Record<string, unknown>;
  const copy = {
    ...rest,
    title: `${(rest as { title: string }).title} (copy)`,
    slug: `${(rest as { slug: string }).slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
    status: "draft",
    featured: false,
    published_at: null,
  };
  const { data: created, error: insErr } = await supabase
    .from("works")
    .insert(copy as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true, id: created?.id, message: "Duplicated" };
}

export async function deleteWork(id: string): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true, message: "Deleted" };
}

export async function reorderWorks(order: { id: string; sortOrder: number }[]): Promise<ActionResult> {
  const supabase = await db();
  for (const o of order) {
    await supabase.from("works").update({ sort_order: o.sortOrder } as never).eq("id", o.id);
  }
  revalidateSite();
  return { ok: true };
}

/* ─────────────────────── collections ──────────────────── */

export async function saveCollection(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = collectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;
  const supabase = await db();
  const row = {
    slug: v.slug || slugify(v.title),
    title: v.title,
    description: v.description,
    period: v.period,
    cover_image: normalizeImageUrl(v.coverImage) || null,
    featured: v.featured,
    published: v.published,
    sort_order: v.sortOrder,
    updated_at: new Date().toISOString(),
  };
  const { error, data } = id
    ? await supabase.from("collections").update(row as never).eq("id", id).select("id").maybeSingle<{ id: string }>()
    : await supabase.from("collections").insert(row as never).select("id").maybeSingle<{ id: string }>();
  if (error) return { ok: false, error: error.message };
  revalidateSite(`/work/collection/${row.slug}`);
  return { ok: true, message: "Saved", id: data?.id ?? id ?? undefined };
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true, message: "Deleted" };
}

/* ─────────────────────── exhibitions ──────────────────── */

export async function saveExhibition(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = exhibitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;
  const supabase = await db();
  const row = {
    title: v.title,
    year: v.year,
    venue: v.venue,
    city: v.city,
    country: v.country,
    type: v.type,
    date_label: v.dateLabel,
    description: v.description,
    url: v.url || null,
    published: v.published,
    sort_order: v.sortOrder,
    related_slugs: splitList(v.relatedSlugs ?? ""),
    updated_at: new Date().toISOString(),
  };
  const { error, data } = id
    ? await supabase.from("exhibitions").update(row as never).eq("id", id).select("id").maybeSingle<{ id: string }>()
    : await supabase.from("exhibitions").insert(row as never).select("id").maybeSingle<{ id: string }>();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/exhibitions");
  return { ok: true, message: "Saved", id: data?.id ?? id ?? undefined };
}

export async function deleteExhibition(id: string): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase.from("exhibitions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/exhibitions");
  return { ok: true, message: "Deleted" };
}

/* ──────────────────────── timeline ────────────────────── */

export async function saveTimelineEntry(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = timelineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;
  const supabase = await db();
  const row = {
    year: v.year,
    title: v.title,
    description: v.description,
    image: normalizeImageUrl(v.image) || null,
    category: v.category,
    sort_order: v.sortOrder,
    published: v.published,
    updated_at: new Date().toISOString(),
  };
  const { error, data } = id
    ? await supabase.from("timeline_entries").update(row as never).eq("id", id).select("id").maybeSingle<{ id: string }>()
    : await supabase.from("timeline_entries").insert(row as never).select("id").maybeSingle<{ id: string }>();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/about");
  revalidatePath("/");
  return { ok: true, message: "Saved", id: data?.id ?? id ?? undefined };
}

export async function deleteTimelineEntry(id: string): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase.from("timeline_entries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/about");
  return { ok: true, message: "Deleted" };
}

/* ──────────────────────── inquiries ───────────────────── */

export async function updateInquiryStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  const parsed = inquiryStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status" };
  const supabase = await db();
  const { error } = await supabase
    .from("inquiries")
    .update({ status: parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  return { ok: true, message: "Status updated" };
}

export async function addInquiryNote(id: string, body: string): Promise<ActionResult> {
  const clean = z.string().trim().min(1).max(4000).safeParse(body);
  if (!clean.success) return { ok: false, error: "Note is empty" };
  const supabase = await db();
  const { error } = await supabase
    .from("inquiry_notes")
    .insert({ inquiry_id: id, body: clean.data } as never);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/inquiries/${id}`);
  return { ok: true, message: "Note added" };
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inquiries");
  return { ok: true, message: "Deleted" };
}

/* ───────────────────────── profile ────────────────────── */

export async function saveProfile(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;
  const supabase = await db();

  const social: { label: string; href: string }[] = [];
  const socialRaw = String(formData.get("social") ?? "");
  socialRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [label, href] = line.split("|").map((s) => s.trim());
      if (label && href) social.push({ label, href });
    });

  const education: { qualification: string; institution: string }[] = [];
  String(formData.get("education") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [qualification, institution] = line.split("|").map((s) => s.trim());
      if (qualification && institution) education.push({ qualification, institution });
    });

  const row = {
    id: "default",
    name: v.name,
    roles: splitList(v.roles),
    headline: v.headline,
    statement: v.statement,
    bio: toParagraphs(v.bio),
    education,
    email: v.email,
    phone: v.phone,
    whatsapp: v.whatsapp,
    location: v.location,
    portrait: normalizeImageUrl(v.portrait) || null,
    social,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("profile").upsert(row as never, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  revalidateSite("/contact");
  return { ok: true, message: "Profile saved" };
}

/* ───────────────────────── settings ───────────────────── */

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;
  const supabase = await db();
  const row = {
    id: "default",
    brand: v.brand,
    brand_line: v.brandLine,
    tagline: v.tagline,
    footer_note: v.footerNote,
    hero: {
      eyebrow: v.heroEyebrow,
      heading: v.heroHeading,
      supporting: v.heroSupporting,
      ctaLabel: v.heroCtaLabel,
      ctaHref: v.heroCtaHref,
      workSlug: v.heroWorkSlug,
      image: null,
      showMeta: true,
    },
    contact_copy: { heading: v.contactHeading, supporting: v.contactSupporting },
    seo: {
      defaultTitle: v.seoDefaultTitle,
      titleTemplate: "%s — Conscious Omnium",
      description: v.seoDescription,
      ogImage: "/work/the-black-taj-mahal.jpg",
    },
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("site_settings").upsert(row as never, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  revalidateSite("/contact");
  return { ok: true, message: "Settings saved" };
}

/* ────────────────────────── pages ─────────────────────── */

export async function savePage(slug: string, formData: FormData): Promise<ActionResult> {
  const supabase = await db();
  const sectionsRaw = String(formData.get("sectionsJson") ?? "[]");
  let sections: unknown = [];
  try {
    const parsedSections = JSON.parse(sectionsRaw);
    sections = Array.isArray(parsedSections)
      ? parsedSections.map((s) =>
          s && typeof s === "object" && "image" in s && s.image
            ? { ...s, image: normalizeImageUrl(String(s.image)) }
            : s,
        )
      : parsedSections;
  } catch {
    return { ok: false, error: "Malformed section data" };
  }
  const row = {
    slug,
    title: String(formData.get("title") ?? slug),
    intro: String(formData.get("intro") ?? "") || null,
    sections,
    seo: {
      title: String(formData.get("seoTitle") ?? "") || null,
      description: String(formData.get("seoDescription") ?? "") || null,
    },
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("pages").upsert(row as never, { onConflict: "slug" });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${slug}`);
  return { ok: true, message: "Page saved" };
}

/* ────────────────────────── media ─────────────────────── */

export async function recordMediaUpload(entry: {
  bucket: string;
  path: string;
  url: string;
  folder: string;
  size?: number;
  contentType?: string;
  alt?: string;
  width?: number;
  height?: number;
}): Promise<ActionResult> {
  const supabase = await db();
  const { error } = await supabase.from("media").insert({
    bucket: entry.bucket,
    path: entry.path,
    url: entry.url,
    folder: entry.folder,
    size: entry.size ?? null,
    content_type: entry.contentType ?? null,
    alt: entry.alt ?? null,
    width: entry.width ?? null,
    height: entry.height ?? null,
  } as never);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/media");
  return { ok: true, message: "Uploaded" };
}

export async function deleteMedia(id: string, bucket: string, path: string): Promise<ActionResult> {
  const supabase = await db();
  await supabase.storage.from(bucket).remove([path]);
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/media");
  return { ok: true, message: "Deleted" };
}

/* ─────────────────── visual editor (Publish) ──────────────────── */

const SLUG_PATH: Record<string, string> = {
  home: "/",
  about: "/about",
  studio: "/studio",
  work: "/work",
  exhibitions: "/exhibitions",
  contact: "/contact",
};

/** True when a write failed only because the column doesn't exist yet
 *  (migration not applied). Covers raw Postgres (42703) and PostgREST's
 *  schema-cache message (PGRST204 / "Could not find the 'x' column"). */
function isMissingColumn(
  error: { code?: string; message?: string } | null,
  column: string,
): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  const m = (error.message ?? "").toLowerCase();
  return (
    m.includes(column.toLowerCase()) &&
    (m.includes("does not exist") ||
      m.includes("schema cache") ||
      m.includes("could not find"))
  );
}

type IdRow = { id: string };

/** Upsert an editable DB collection: update existing rows by id, insert new
 *  ones (temp ids stripped), delete rows removed since the baseline. */
async function syncCollection<T extends IdRow>(
  supabase: Awaited<ReturnType<typeof db>>,
  table: string,
  rows: T[] | undefined,
  baseline: T[] | undefined,
  toRow: (r: T) => Record<string, unknown>,
): Promise<string | null> {
  if (!rows) return null;
  const curIds = new Set(rows.filter((r) => isRealId(r.id)).map((r) => r.id));

  const toDelete = (baseline ?? [])
    .map((b) => b.id)
    .filter((id) => isRealId(id) && !curIds.has(id));
  if (toDelete.length) {
    const { error } = await supabase.from(table).delete().in("id", toDelete);
    if (error) return `${table} delete: ${error.message}`;
  }

  const baseIds = new Set((baseline ?? []).map((b) => b.id));
  for (const r of rows) {
    const row = toRow(r);
    if (isRealId(r.id) && baseIds.has(r.id)) {
      const { error } = await supabase.from(table).update(row as never).eq("id", r.id);
      if (error) return `${table} update: ${error.message}`;
    } else {
      delete row.id;
      const { error } = await supabase.from(table).insert(row as never);
      if (error) return `${table} insert: ${error.message}`;
    }
  }
  return null;
}

export async function publishSite(payload: {
  pages: Record<string, unknown>;
  settings: Record<string, unknown>;
  profile?: unknown;
  collections?: IdRow[];
  exhibitions?: IdRow[];
  timeline?: IdRow[];
  works?: IdRow[];
  baseline?: {
    collections?: IdRow[];
    exhibitions?: IdRow[];
    timeline?: IdRow[];
    works?: IdRow[];
  };
}): Promise<ActionResult> {
  const supabase = await db();

  for (const [slug, content] of Object.entries(payload.pages ?? {})) {
    if (!SLUG_PATH[slug]) continue;
    const { error } = await supabase
      .from("pages")
      .upsert(
        { slug, title: slug[0].toUpperCase() + slug.slice(1), content } as never,
        { onConflict: "slug" },
      );
    if (error) return { ok: false, error: `pages/${slug}: ${error.message}` };
  }

  const s = (payload.settings ?? {}) as Record<string, unknown>;
  const core: Record<string, unknown> = {};
  if (s.hero !== undefined) core.hero = s.hero;
  if (s.contactCopy !== undefined) core.contact_copy = s.contactCopy;
  if (s.nav !== undefined) core.nav = s.nav;
  if (s.brand !== undefined) core.brand = s.brand;
  if (s.brandLine !== undefined) core.brand_line = s.brandLine;
  if (s.tagline !== undefined) core.tagline = s.tagline;
  if (s.footerNote !== undefined) core.footer_note = s.footerNote;

  if (Object.keys(core).length) {
    core.id = "default";
    core.updated_at = new Date().toISOString();
    const { error } = await supabase
      .from("site_settings")
      .upsert(core as never, { onConflict: "id" });
    if (error) return { ok: false, error: `settings: ${error.message}` };
  }

  // theme + footer legal need migration 0003 — best-effort.
  let chromeSkipped = false;
  const extra: Record<string, unknown> = { id: "default", updated_at: new Date().toISOString() };
  if (s.theme !== undefined) extra.theme = s.theme;
  if (s.footerLegal !== undefined || s.footerOwner !== undefined) {
    extra.footer = { legal: s.footerLegal ?? "", owner: s.footerOwner ?? "" };
  }
  if (Object.keys(extra).length > 2) {
    const { error } = await supabase
      .from("site_settings")
      .upsert(extra as never, { onConflict: "id" });
    if (error) {
      if (isMissingColumn(error, "theme") || isMissingColumn(error, "footer")) chromeSkipped = true;
      else return { ok: false, error: `theme: ${error.message}` };
    }
  }

  if (payload.profile) {
    const { error } = await supabase
      .from("profile")
      .upsert(profileRow(payload.profile as never) as never, { onConflict: "id" });
    if (error) return { ok: false, error: `profile: ${error.message}` };
  }

  const syncs = [
    ["collections", payload.collections, payload.baseline?.collections, collectionRow],
    ["exhibitions", payload.exhibitions, payload.baseline?.exhibitions, exhibitionRow],
    ["timeline_entries", payload.timeline, payload.baseline?.timeline, timelineRow],
    ["works", payload.works, payload.baseline?.works, workRow],
  ] as const;
  for (const [table, cur, base, toRow] of syncs) {
    const err = await syncCollection(
      supabase,
      table,
      cur as IdRow[] | undefined,
      base as IdRow[] | undefined,
      toRow as (r: IdRow) => Record<string, unknown>,
    );
    if (err) return { ok: false, error: err };
  }

  revalidateSite("/contact");
  return {
    ok: true,
    message: chromeSkipped
      ? "Published (theme/footer skipped — run migration 0003)"
      : "Published to the live site",
  };
}
