-- ═══════════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — 0003 · theme + chrome for the visual editor
--  Adds editable theme tokens (colours / fonts / spacing) and gives
--  header + footer their own JSON blobs. All optional — an empty
--  object means "use the built-in defaults", so the site is unchanged
--  until something is published. RLS unchanged (admin write, public read).
-- ═══════════════════════════════════════════════════════════════════

alter table public.site_settings
  add column if not exists theme  jsonb not null default '{}'::jsonb,
  add column if not exists header jsonb not null default '{}'::jsonb,
  add column if not exists footer jsonb not null default '{}'::jsonb;

-- Verify:
--   select id, jsonb_typeof(theme), jsonb_typeof(header), jsonb_typeof(footer)
--   from public.site_settings;
