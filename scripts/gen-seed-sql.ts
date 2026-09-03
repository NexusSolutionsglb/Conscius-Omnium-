/**
 * Emits `supabase/seed.sql` from the bundled content so the whole
 * database can be populated in the Supabase SQL editor — no service-role
 * key, no CLI. Run: `npx tsx scripts/gen-seed-sql.ts`
 */

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
  "--  CONSCIOUS OMNIUM — seed data (generated from lib/content)",
  "--  Run AFTER 0001_init.sql. Safe to re-run.",
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

// site_settings
lines.push(
  `insert into public.site_settings (id, brand, brand_line, tagline, nav, hero, footer_note, contact_copy, seo) values (
  'default', ${q(settingsSeed.brand)}, ${q(settingsSeed.brandLine)}, ${q(settingsSeed.tagline)}, ${q(settingsSeed.nav)},
  ${q(settingsSeed.hero)}, ${q(settingsSeed.footerNote)}, ${q(settingsSeed.contactCopy)}, ${q(settingsSeed.seo)})
on conflict (id) do update set
  brand = excluded.brand, brand_line = excluded.brand_line, tagline = excluded.tagline, nav = excluded.nav,
  hero = excluded.hero, footer_note = excluded.footer_note, contact_copy = excluded.contact_copy, seo = excluded.seo;`,
  "",
);

// collections
for (const c of collectionsSeed) {
  lines.push(
    `insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  ${q(c.slug)}, ${q(c.title)}, ${q(c.description)}, ${q(c.period)}, ${q(c.coverImage)}, ${q(c.featured)}, ${q(c.published)}, ${q(c.sortOrder)})
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;`,
  );
}
lines.push("");

// works
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
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;`,
  );
}
lines.push("");

// exhibitions — no natural key; replace the set
lines.push("delete from public.exhibitions;");
for (const e of exhibitionsSeed) {
  lines.push(
    `insert into public.exhibitions (title, year, venue, city, country, type, date_label, description, url, published, sort_order, related_slugs) values (
  ${q(e.title)}, ${q(e.year)}, ${q(e.venue)}, ${q(e.city)}, ${q(e.country)}, ${q(e.type)}, ${q(e.dateLabel)}, ${q(e.description)}, ${q(e.url)}, ${q(e.published)}, ${q(e.sortOrder)}, ${q(e.relatedSlugs ?? [])});`,
  );
}
lines.push("");

// timeline — no natural key; replace the set
lines.push("delete from public.timeline_entries;");
for (const t of timelineSeed) {
  lines.push(
    `insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  ${q(t.year)}, ${q(t.title)}, ${q(t.description)}, ${q(t.image)}, ${q(t.category)}, ${q(t.sortOrder)}, ${q(t.published)});`,
  );
}
lines.push("");

// pages
for (const p of pagesSeed) {
  lines.push(
    `insert into public.pages (slug, title, intro, sections, seo) values (
  ${q(p.slug)}, ${q(p.title)}, ${q(p.intro)}, ${q(p.sections)}, ${q(p.seo ?? {})})
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;`,
  );
}
lines.push("");

const out = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${out} (${lines.length} lines)`);
