import type { NextConfig } from "next";

/**
 * Supabase Storage is the production image host. We allow its public object URL
 * pattern so `next/image` can optimise remote artwork. When SUPABASE isn't
 * configured the site serves bundled images from /public/work instead.
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
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
