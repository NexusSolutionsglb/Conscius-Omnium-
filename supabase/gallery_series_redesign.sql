-- ═══════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM™ — series gallery + white / Century Gothic pass
--
--  The live database overrides the defaults compiled into the app, so a
--  saved theme (beige paper, the old serif face) would keep showing even
--  though the stylesheet has moved on. This resets the theme override to
--  the new house values.
--
--  Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- 1 ── Theme: white ground, Century Gothic everywhere.
--     `theme` is a jsonb column of overrides; anything left out falls
--     back to app/globals.css. Setting the fonts to "century" pins the
--     stack defined there (Century Gothic → Questrial fallback).
DO $$
BEGIN
  UPDATE public.site_settings
  SET theme = coalesce(theme, '{}'::jsonb) || jsonb_build_object(
    'colorPaper',    '#ffffff',
    'colorInk',      '#111111',
    'colorInkSoft',  '#3a3a3a',
    'colorInkMute',  '#7a7a7a',
    'fontDisplay',   'century',
    'fontSans',      'century'
  )
  WHERE id = 'default';
EXCEPTION WHEN undefined_column THEN
  RAISE NOTICE 'site_settings.theme not present — skipping theme reset.';
END $$;

-- 2 ── Every published artwork should belong to a series, otherwise it
--     only appears in the gallery's "Other works" row. This reports the
--     strays so they can be filed from Admin → Series.
DO $$
DECLARE
  stray int;
BEGIN
  SELECT count(*) INTO stray
  FROM public.works w
  WHERE w.status = 'published'
    AND (
      w.collection_slug IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM public.collections c
        WHERE c.slug = w.collection_slug AND c.published
      )
    );
  RAISE NOTICE '% published artwork(s) are not in a published series.', stray;
END $$;

-- 3 ── Give every series a cover: fall back to the first artwork filed
--     under it, so no series card renders empty on /gallery.
UPDATE public.collections c
SET cover_image = sub.cover_image
FROM (
  SELECT DISTINCT ON (w.collection_slug)
         w.collection_slug, w.cover_image
  FROM public.works w
  WHERE w.status = 'published' AND w.cover_image IS NOT NULL
  ORDER BY w.collection_slug, w.sort_order
) AS sub
WHERE c.slug = sub.collection_slug
  AND (c.cover_image IS NULL OR c.cover_image = '');
