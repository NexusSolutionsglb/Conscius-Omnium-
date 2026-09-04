-- ═══════════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — 0002 · page content for the visual editor
--  Adds a typed `content` JSON blob to every managed page and ensures
--  a row exists for the pages that previously had no DB record
--  (home, work, exhibitions). RLS is unchanged: the existing
--  "pages read" (public) and "pages write" (admin) policies apply.
-- ═══════════════════════════════════════════════════════════════════

alter table public.pages
  add column if not exists content jsonb not null default '{}'::jsonb;

insert into public.pages (slug, title)
values
  ('home',        'Home'),
  ('work',        'Work'),
  ('exhibitions', 'Exhibitions')
on conflict (slug) do nothing;

-- Verify:
--   select slug, jsonb_typeof(content) as content_type from public.pages order by slug;
-- Expect rows for about, contact, exhibitions, home, studio, work — all 'object'.
