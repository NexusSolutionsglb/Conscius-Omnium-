import type { Metadata } from "next";
import { env } from "@/lib/env";
import { settingsSeed } from "@/lib/content";
import type { Profile, SiteSettings, Work } from "@/lib/types";
import { DISCIPLINE_LABELS } from "@/lib/types";
import { absoluteUrl, truncate } from "@/lib/utils";

type BuildMeta = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  publishedTime?: string | null;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
  publishedTime,
}: BuildMeta): Metadata {
  const s = settingsSeed;
  const resolvedTitle = title
    ? s.seo.titleTemplate.replace("%s", title)
    : s.seo.defaultTitle;
  const resolvedDescription = truncate(description || s.seo.description, 300);
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || s.seo.ogImage);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type,
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: s.brand,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: resolvedTitle }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage],
    },
  };
}

/* ─── JSON-LD ──────────────────────────────────────────────── */

export function personJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.roles.join(", "),
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    url: env.siteUrl,
    address: { "@type": "PostalAddress", addressLocality: profile.location },
    alumniOf: profile.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.institution,
    })),
    ...(profile.social.length
      ? { sameAs: profile.social.map((sm) => sm.href) }
      : {}),
  };
}

export function websiteJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.brand,
    alternateName: settings.brandLine,
    url: env.siteUrl,
    description: settings.seo.description,
  };
}

export function workJsonLd(work: Work) {
  const isVisualArt = ["art", "photography"].includes(work.discipline);
  return {
    "@context": "https://schema.org",
    "@type": isVisualArt ? "VisualArtwork" : "CreativeWork",
    name: work.title,
    url: absoluteUrl(`/work/${work.slug}`),
    image: absoluteUrl(work.coverImage),
    abstract: work.summary,
    ...(work.description.length ? { description: work.description.join(" ") } : {}),
    ...(work.year ? { dateCreated: work.year } : {}),
    ...(work.medium ? { artMedium: work.medium } : {}),
    ...(work.dimensions ? { size: work.dimensions } : {}),
    genre: DISCIPLINE_LABELS[work.discipline],
    creator: { "@type": "Person", name: "Shivjeet Potdar", url: env.siteUrl },
    ...(work.priceVisible && work.price
      ? {
          offers: {
            "@type": "Offer",
            price: work.price,
            priceCurrency: work.currency ?? "INR",
            availability:
              work.availability === "available"
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
