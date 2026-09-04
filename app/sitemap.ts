import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getPublishedWorks } from "@/lib/queries/works";
import { getCollections } from "@/lib/queries/collections";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const [works, collections] = await Promise.all([
    getPublishedWorks(),
    getCollections(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/studio`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/exhibitions`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const workRoutes: MetadataRoute.Sitemap = works.map((w) => ({
    url: `${base}/work/${w.slug}`,
    lastModified: w.updatedAt ? new Date(w.updatedAt) : undefined,
    changeFrequency: "monthly",
    priority: w.featured ? 0.8 : 0.6,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${base}/work/collection/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...workRoutes, ...collectionRoutes];
}
