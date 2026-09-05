/**
 * Client-review draft mode. While true:
 *   - every public page carries a visible "Draft — not final" banner
 *     (`components/site/draft-banner.tsx`, mounted in the `(site)` layout)
 *   - every page is marked `noindex, nofollow` (via `buildMetadata` in
 *     `lib/seo.ts`) and `robots.txt` disallows the whole site — so this
 *     draft never gets indexed while the client is still reviewing it
 *
 * AT FINAL HANDOVER: flip this to `false` (or delete it and the two call
 * sites below) and redeploy. That's the entire cutover — nothing else
 * changes shape.
 */
export const IS_DRAFT_REVIEW = true;
