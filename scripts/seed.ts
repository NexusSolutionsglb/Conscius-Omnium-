/**
 * Pushes the bundled portfolio content (lib/content) into Supabase.
 * Safe to re-run — every table is upserted on its natural key.
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in
 * .env.local (loaded here via dotenv).
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

import {
  collectionsSeed,
  exhibitionsSeed,
  pagesSeed,
  profileSeed,
  settingsSeed,
  timelineSeed,
  worksSeed,
} from "../lib/content";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "\n✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Fill them in .env.local and try again.\n",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function run() {
  console.log("→ profile");
  await supabase.from("profile").upsert({
    id: "default",
    name: profileSeed.name,
    roles: profileSeed.roles,
    headline: profileSeed.headline,
    statement: profileSeed.statement,
    bio: profileSeed.bio,
    education: profileSeed.education,
    email: profileSeed.email,
    phone: profileSeed.phone,
    whatsapp: profileSeed.whatsapp,
    location: profileSeed.location,
    portrait: profileSeed.portrait,
    social: profileSeed.social,
  });

  console.log("→ site_settings");
  await supabase.from("site_settings").upsert({
    id: "default",
    brand: settingsSeed.brand,
    brand_line: settingsSeed.brandLine,
    tagline: settingsSeed.tagline,
    nav: settingsSeed.nav,
    hero: settingsSeed.hero,
    footer_note: settingsSeed.footerNote,
    contact_copy: settingsSeed.contactCopy,
    seo: settingsSeed.seo,
  });

  console.log(`→ collections (${collectionsSeed.length})`);
  for (const c of collectionsSeed) {
    await supabase.from("collections").upsert(
      {
        slug: c.slug,
        title: c.title,
        description: c.description,
        period: c.period,
        cover_image: c.coverImage,
        featured: c.featured,
        published: c.published,
        sort_order: c.sortOrder,
      },
      { onConflict: "slug" },
    );
  }

  console.log(`→ works (${worksSeed.length})`);
  for (const w of worksSeed) {
    await supabase.from("works").upsert(
      {
        slug: w.slug,
        title: w.title,
        year: w.year,
        year_sort: w.yearSort,
        discipline: w.discipline,
        kind: w.kind,
        medium: w.medium,
        dimensions: w.dimensions,
        client: w.client,
        location: w.location,
        role: w.role,
        summary: w.summary,
        description: w.description,
        statement: w.statement,
        concept: w.concept,
        process: w.process,
        credits: w.credits ?? [],
        collection_slug: w.collectionSlug,
        status: w.status,
        availability: w.availability,
        price: w.price,
        currency: w.currency ?? "INR",
        price_visible: w.priceVisible,
        featured: w.featured,
        sort_order: w.sortOrder,
        cover_image: w.coverImage,
        accent: w.accent,
        images: w.images,
        related_slugs: w.relatedSlugs ?? [],
        seo: w.seo ?? {},
        published_at: w.publishedAt,
      },
      { onConflict: "slug" },
    );
  }

  console.log(`→ exhibitions (${exhibitionsSeed.length})`);
  // No natural key — replace the set so re-runs stay idempotent.
  await supabase.from("exhibitions").delete().not("id", "is", null);
  for (const e of exhibitionsSeed) {
    await supabase.from("exhibitions").insert({
      title: e.title,
      year: e.year,
      venue: e.venue,
      city: e.city,
      country: e.country,
      type: e.type,
      date_label: e.dateLabel,
      description: e.description,
      url: e.url,
      published: e.published,
      sort_order: e.sortOrder,
      related_slugs: e.relatedSlugs ?? [],
    });
  }

  console.log(`→ timeline_entries (${timelineSeed.length})`);
  await supabase.from("timeline_entries").delete().not("id", "is", null);
  for (const t of timelineSeed) {
    await supabase.from("timeline_entries").insert({
      year: t.year,
      title: t.title,
      description: t.description,
      image: t.image,
      category: t.category,
      sort_order: t.sortOrder,
      published: t.published,
    });
  }

  console.log(`→ pages (${pagesSeed.length})`);
  for (const p of pagesSeed) {
    await supabase.from("pages").upsert(
      {
        slug: p.slug,
        title: p.title,
        intro: p.intro,
        sections: p.sections,
        seo: p.seo ?? {},
      },
      { onConflict: "slug" },
    );
  }

  console.log("\n✓ Seed complete.\n");
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
