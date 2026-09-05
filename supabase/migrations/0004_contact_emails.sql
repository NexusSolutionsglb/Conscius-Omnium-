-- ═══════════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — 0004 · the three studio addresses
--  The site publishes a purpose-specific address in each context:
--    enquiry_email — enquiries, commissions and bookings (contact form)
--    info_email    — general information (footer, About, legal, JSON-LD)
--    studio_email  — studio, services and project correspondence
--  `email` stays the artist's own address. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════

alter table public.profile
  add column if not exists enquiry_email text not null default '',
  add column if not exists info_email    text not null default '',
  add column if not exists studio_email  text not null default '';

-- Fill in the studio's addresses wherever they are still blank.
update public.profile
set
  enquiry_email = coalesce(nullif(enquiry_email, ''), 'enquiry@consciusomnium.com'),
  info_email    = coalesce(nullif(info_email, ''),    'info@consciusomnium.com'),
  studio_email  = coalesce(nullif(studio_email, ''),  'studio@consciusomnium.com'),
  updated_at    = now();

-- Verify:
--   select id, email, enquiry_email, info_email, studio_email from public.profile;
