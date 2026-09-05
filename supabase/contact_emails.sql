-- ═══════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM™ — contact addresses patch
--  Paste this into the Supabase SQL Editor and Run. It is the same
--  as migrations/0004_contact_emails.sql, but it also forces the
--  three addresses onto an existing row that already has values.
--  Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

alter table public.profile
  add column if not exists enquiry_email text not null default '',
  add column if not exists info_email    text not null default '',
  add column if not exists studio_email  text not null default '';

update public.profile
set
  enquiry_email = 'enquiry@consciusomnium.com',
  info_email    = 'info@consciusomnium.com',
  studio_email  = 'studio@consciusomnium.com',
  updated_at    = now()
where id = 'default';

-- Verify:
--   select id, email, enquiry_email, info_email, studio_email from public.profile;
