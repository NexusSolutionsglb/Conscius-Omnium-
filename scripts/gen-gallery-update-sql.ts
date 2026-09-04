// Emits `supabase/gallery_update.sql` for the Supabase SQL editor.
//
// This revision REPLACES the entire works/collections/exhibitions/timeline
// tables with the current (now purely real, client-supplied) content —
// the old placeholder architecture/film/photography portfolio has been
// removed from lib/content, and this script deletes the matching rows from
// the live database too. profile/site_settings/the 'about' page are
// upserted (single row each). Nothing outside these tables is touched.
//
// Run: npx tsx scripts/gen-gallery-update-sql.ts

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  collectionsSeed,
  exhibitionsSeed,
  pagesSeed,
  profileSeed,
  settingsSeed,
  timelineSeed,
  worksSeed,
} from "../lib/content";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const lines: string[] = [
  "-- ═══════════════════════════════════════════════════════════════",
  "--  CONSCIUS OMNIUM™ — full resync to the real gallery content",
  "--  Replaces works/collections/exhibitions/timeline_entries entirely",
  "--  (the old placeholder portfolio is gone from the codebase — this",
  "--  removes it from the database too) and upserts profile, the core",
  "--  site_settings columns, and the 'about' page. Safe to re-run.",
  "-- ═══════════════════════════════════════════════════════════════",
  "",
];

// profile
lines.push(
  `insert into public.profile (id, name, roles, headline, statement, bio, education, email, phone, whatsapp, location, portrait, social) values (
  'default', ${q(profileSeed.name)}, ${q(profileSeed.roles)}, ${q(profileSeed.headline)}, ${q(profileSeed.statement)},
  ${q(profileSeed.bio)}, ${q(profileSeed.education)}, ${q(profileSeed.email)}, ${q(profileSeed.phone)},
  ${q(profileSeed.whatsapp)}, ${q(profileSeed.location)}, ${q(profileSeed.portrait)}, ${q(profileSeed.social)})
on conflict (id) do update set
  name = excluded.name, roles = excluded.roles, headline = excluded.headline, statement = excluded.statement,
  bio = excluded.bio, education = excluded.education, email = excluded.email, phone = excluded.phone,
  whatsapp = excluded.whatsapp, location = excluded.location, portrait = excluded.portrait, social = excluded.social;`,
  "",
);

// site_settings — core columns (guaranteed present since 0001_init.sql)
lines.push(
  `insert into public.site_settings (id, brand, brand_line, tagline, nav, hero, footer_note, contact_copy, seo) values (
  'default', ${q(settingsSeed.brand)}, ${q(settingsSeed.brandLine)}, ${q(settingsSeed.tagline)}, ${q(settingsSeed.nav)},
  ${q(settingsSeed.hero)}, ${q(settingsSeed.footerNote)}, ${q(settingsSeed.contactCopy)}, ${q(settingsSeed.seo)})
on conflict (id) do update set
  brand = excluded.brand, brand_line = excluded.brand_line, tagline = excluded.tagline, nav = excluded.nav,
  hero = excluded.hero, footer_note = excluded.footer_note, contact_copy = excluded.contact_copy, seo = excluded.seo;`,
  "",
);

// site_settings.header (logo) — best-effort; needs migration 0003_site_chrome.sql.
// Wrapped so a missing column can't roll back everything above.
lines.push(
  `DO $$
BEGIN
  UPDATE public.site_settings
  SET header = ${q({ logo: settingsSeed.logo, logoInverted: settingsSeed.logoInverted })}
  WHERE id = 'default';
EXCEPTION WHEN undefined_column THEN
  RAISE NOTICE 'site_settings.header does not exist yet — run supabase/migrations/0003_site_chrome.sql first, then re-run this block to pick up the logo.';
END $$;`,
  "",
);

// pages — every managed page (about / studio / contact). The studio page in
// particular still pointed at the deleted /work/*.jpg imagery.
for (const page of pagesSeed) {
  lines.push(
    `insert into public.pages (slug, title, intro, sections, seo) values (
  ${q(page.slug)}, ${q(page.title)}, ${q(page.intro)}, ${q(page.sections)}, ${q(page.seo ?? {})})
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;`,
  );
}
lines.push("");

// pages.content — the visual editor's per-page overrides. Home, the gallery
// index and studio still hold copy written for the old placeholder portfolio,
// and it wins over the bundled defaults, so clear those three back to empty.
// (Needs 0002_page_content.sql; wrapped so a missing column can't roll back.)
lines.push(
  `DO $$
BEGIN
  UPDATE public.pages SET content = '{}'::jsonb WHERE slug in ('home', 'work', 'studio');
EXCEPTION WHEN undefined_column THEN
  RAISE NOTICE 'pages.content does not exist yet — run supabase/migrations/0002_page_content.sql, then re-run this block.';
END $$;`,
  "",
);

// collections — full replace (old architecture/film/photography series removed)
lines.push("delete from public.collections;");
for (const c of collectionsSeed) {
  lines.push(
    `insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  ${q(c.slug)}, ${q(c.title)}, ${q(c.description)}, ${q(c.period)}, ${q(c.coverImage)}, ${q(c.featured)}, ${q(c.published)}, ${q(c.sortOrder)});`,
  );
}
lines.push("");

// works — full replace (old placeholder portfolio removed)
lines.push("delete from public.work_images;", "delete from public.works;");
for (const w of worksSeed) {
  lines.push(
    `insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  ${q(w.slug)}, ${q(w.title)}, ${q(w.year)}, ${q(w.yearSort)}, ${q(w.discipline)}, ${q(w.kind)}, ${q(w.medium)}, ${q(w.dimensions)}, ${q(w.client)}, ${q(w.location)}, ${q(w.role)},
  ${q(w.summary)}, ${q(w.description)}, ${q(w.statement)}, ${q(w.concept)}, ${q(w.process)}, ${q(w.credits ?? [])}, ${q(w.collectionSlug)}, ${q(w.status)}, ${q(w.availability)},
  ${q(w.price)}, ${q(w.currency ?? "INR")}, ${q(w.priceVisible)}, ${q(w.featured)}, ${q(w.sortOrder)}, ${q(w.coverImage)}, ${q(w.accent)}, ${q(w.images)}, ${q(w.relatedSlugs ?? [])}, ${q(w.seo ?? {})}, ${q(w.publishedAt)}
);`,
  );
}
lines.push("");

// exhibitions — full replace (empty: none were supplied)
lines.push("delete from public.exhibitions;");
for (const e of exhibitionsSeed) {
  lines.push(
    `insert into public.exhibitions (title, year, venue, city, country, type, date_label, description, url, published, sort_order, related_slugs) values (
  ${q(e.title)}, ${q(e.year)}, ${q(e.venue)}, ${q(e.city)}, ${q(e.country)}, ${q(e.type)}, ${q(e.dateLabel)}, ${q(e.description)}, ${q(e.url)}, ${q(e.published)}, ${q(e.sortOrder)}, ${q(e.relatedSlugs ?? [])});`,
  );
}
lines.push("");

// timeline — full replace (empty: none were supplied)
lines.push("delete from public.timeline_entries;");
for (const t of timelineSeed) {
  lines.push(
    `insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  ${q(t.year)}, ${q(t.title)}, ${q(t.description)}, ${q(t.image)}, ${q(t.category)}, ${q(t.sortOrder)}, ${q(t.published)});`,
  );
}
lines.push("");

const out = join(process.cwd(), "supabase", "gallery_update.sql");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(
  `Wrote ${out} (${collectionsSeed.length} collections, ${worksSeed.length} works, ${exhibitionsSeed.length} exhibitions, ${timelineSeed.length} timeline entries)`,
);
