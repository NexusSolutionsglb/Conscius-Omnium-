import type { NextConfig } from "next";

/**
 * Supabase Storage is the production image host. We allow its public object URL
 * pattern so `next/image` can optimise remote artwork. When SUPABASE isn't
 * configured the site serves bundled images from /public/gallery instead.
 */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Cloudflare Workers can't run the sharp-based Node optimizer next/image
    // uses elsewhere, so images are served as-is here. Flip this back to
    // `false` (and uncomment the `images` binding in wrangler.jsonc) once
    // Cloudflare Images is enabled for the zone — that restores on-the-fly
    // device-size variants via Cloudflare's own resizing instead.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Tolerate localhost image URLs during local development so a stray
      // pasted dev URL doesn't 500 the page.
      ...(process.env.NODE_ENV !== "production"
        ? [
            { protocol: "http" as const, hostname: "localhost" },
            { protocol: "http" as const, hostname: "127.0.0.1" },
          ]
        : []),
    ],
    // Artwork is displayed large; allow generous device sizes.
    deviceSizes: [400, 640, 828, 1080, 1280, 1600, 1920, 2560],
    // Optimised derivatives are content-addressed; keep them a good while.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  /**
   * The index used to live at /work; it is the Gallery now. Old links —
   * shared posts, indexed pages, printed cards — are moved on permanently.
   */
  async redirects() {
    return [
      { source: "/work", destination: "/gallery", permanent: true },
      { source: "/work/:path*", destination: "/gallery/:path*", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Belt-and-braces with X-Frame-Options; the visual editor frames the
          // site from its own origin, so `self` must stay allowed.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
          },
        ],
      },
      {
        // Bundled portfolio imagery — stable filenames, safe to cache hard at
        // the edge while still revalidating in the background.
        source: "/gallery/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Cloudflare deploy (via `@opennextjs/cloudflare`): emulates the Workers
// runtime — its bindings (R2 cache, Images) — under plain `next dev`, so
// local dev doesn't need a full `wrangler dev`/preview build to work. A
// no-op everywhere else (Vercel, Node hosting, `next build`), so it's safe
// to leave in unconditionally.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
