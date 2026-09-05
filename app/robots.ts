import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { IS_DRAFT_REVIEW } from "@/lib/draft-mode";

export default function robots(): MetadataRoute.Robots {
  // While this is a client-review draft, keep crawlers out entirely — every
  // page already carries its own noindex tag (see `lib/seo.ts`); this is the
  // belt-and-braces version some crawlers respect before even fetching a page.
  if (IS_DRAFT_REVIEW) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
