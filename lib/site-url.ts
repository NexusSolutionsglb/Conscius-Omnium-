/**
 * Origin resolution, kept in its own module so client bundles can import it
 * without pulling in `lib/env.ts` (which references server-only key names).
 */

/** The canonical production origin. Used whenever nothing better is configured. */
export const PRODUCTION_ORIGIN = "https://www.consciusomnium.com";

/**
 * Resolve the origin used for canonical URLs, the sitemap, OG tags and email
 * links. A misconfigured deploy must never publish `localhost` canonicals, so
 * a production build falls back to the real domain.
 *
 * Only `NEXT_PUBLIC_` variables are read, so the server and the browser always
 * agree on the same answer.
 */
export function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const isLocal =
    !configured ||
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/i.test(configured);

  if (configured && !isLocal) return configured;

  if (process.env.NODE_ENV === "production") {
    const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercel) {
      return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
    }
    return PRODUCTION_ORIGIN;
  }

  return configured || "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path = ""): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
