-- ═══════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM™ — fix the domain typo
--  Migration 0004 was run with "consciousomnium.com" before the real
--  domain ("consciusomnium.com") was confirmed. This corrects any row
--  that still has the wrong spelling. Safe to re-run — it only touches
--  addresses that actually contain the typo.
-- ═══════════════════════════════════════════════════════════════

update public.profile
set
  enquiry_email = replace(enquiry_email, 'consciousomnium.com', 'consciusomnium.com'),
  info_email    = replace(info_email,    'consciousomnium.com', 'consciusomnium.com'),
  studio_email  = replace(studio_email,  'consciousomnium.com', 'consciusomnium.com'),
  updated_at    = now()
where enquiry_email like '%consciousomnium.com%'
   or info_email    like '%consciousomnium.com%'
   or studio_email  like '%consciousomnium.com%';

-- Verify:
--   select id, enquiry_email, info_email, studio_email from public.profile;
