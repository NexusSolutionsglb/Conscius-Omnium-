import type {
  Collection,
  Discipline,
  Exhibition,
  ExhibitionType,
  ManagedPage,
  Profile,
  SiteSettings,
  TimelineEntry,
  Work,
  WorkImage,
} from "@/lib/types";
import type {
  CollectionRow,
  ExhibitionRow,
  PageRow,
  ProfileRow,
  SiteSettingsRow,
  TimelineRow,
  WorkImageRow,
  WorkRow,
} from "@/lib/supabase/database.types";
import { normalizeImageUrl } from "@/lib/utils";
import { asArray, asObject, asStringArray } from "./_shared";

export function mapWorkImage(row: WorkImageRow): WorkImage {
  return {
    id: row.id,
    url: normalizeImageUrl(row.url),
    alt: row.alt,
    kind: row.kind as WorkImage["kind"],
    caption: row.caption,
    width: row.width,
    height: row.height,
    sortOrder: row.sort_order,
  };
}

export function mapWork(row: WorkRow, imageRows: WorkImageRow[] = []): Work {
  const jsonImages = asArray<WorkImage>(row.images).map((im) => ({
    ...im,
    url: normalizeImageUrl(im.url),
  }));
  const seo = asObject<Work["seo"]>(row.seo);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    year: row.year,
    yearSort: row.year_sort,
    discipline: row.discipline as Discipline,
    kind: row.kind,
    medium: row.medium,
    dimensions: row.dimensions,
    client: row.client,
    location: row.location,
    role: row.role,
    summary: row.summary,
    description: asStringArray(row.description),
    statement: row.statement,
    concept: row.concept,
    process: row.process,
    credits: asArray<{ role: string; name: string }>(row.credits),
    collectionSlug: row.collection_slug,
    status: row.status as Work["status"],
    availability: row.availability as Work["availability"],
    price: row.price,
    currency: row.currency,
    priceVisible: row.price_visible,
    featured: row.featured,
    sortOrder: row.sort_order,
    coverImage: normalizeImageUrl(row.cover_image),
    accent: row.accent,
    images: imageRows.length
      ? [...imageRows].sort((a, b) => a.sort_order - b.sort_order).map(mapWorkImage)
      : [...jsonImages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    relatedSlugs: asStringArray(row.related_slugs),
    seo: { ...seo, ogImage: normalizeImageUrl(seo?.ogImage) || null },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    period: row.period,
    coverImage: normalizeImageUrl(row.cover_image) || null,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sort_order,
  };
}

export function mapExhibition(row: ExhibitionRow): Exhibition {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    venue: row.venue,
    city: row.city,
    country: row.country,
    type: row.type as ExhibitionType,
    dateLabel: row.date_label,
    description: row.description,
    url: row.url,
    published: row.published,
    sortOrder: row.sort_order,
    relatedSlugs: asStringArray(row.related_slugs),
  };
}

export function mapTimeline(row: TimelineRow): TimelineEntry {
  return {
    id: row.id,
    year: row.year,
    title: row.title,
    description: row.description,
    image: normalizeImageUrl(row.image) || null,
    category: row.category,
    sortOrder: row.sort_order,
    published: row.published,
  };
}

export function mapPage(row: PageRow): ManagedPage {
  return {
    slug: row.slug as ManagedPage["slug"],
    title: row.title,
    intro: row.intro,
    sections: asArray<ManagedPage["sections"][number]>(row.sections).map((s) => ({
      ...s,
      image: s.image ? normalizeImageUrl(s.image) : s.image,
    })),
    seo: asObject(row.seo),
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    roles: asStringArray(row.roles),
    headline: row.headline,
    statement: row.statement,
    bio: asStringArray(row.bio),
    education: asArray<Profile["education"][number]>(row.education),
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    location: row.location,
    portrait: normalizeImageUrl(row.portrait) || null,
    social: asArray<Profile["social"][number]>(row.social),
  };
}

export function mapSettings(row: SiteSettingsRow): SiteSettings {
  const fallbackNav = [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Studio", href: "/studio" },
    { label: "Exhibitions", href: "/exhibitions" },
    { label: "Contact", href: "/contact" },
  ];
  return {
    brand: row.brand,
    brandLine: row.brand_line,
    tagline: row.tagline,
    nav: asArray<SiteSettings["nav"][number]>(row.nav).length
      ? asArray<SiteSettings["nav"][number]>(row.nav)
      : fallbackNav,
    hero: asObject<SiteSettings["hero"]>(row.hero) as SiteSettings["hero"],
    footerNote: row.footer_note,
    contactCopy: asObject<SiteSettings["contactCopy"]>(
      row.contact_copy,
    ) as SiteSettings["contactCopy"],
    seo: asObject<SiteSettings["seo"]>(row.seo) as SiteSettings["seo"],
    theme: asObject<NonNullable<SiteSettings["theme"]>>(
      (row as { theme?: unknown }).theme,
    ),
    ...(() => {
      const footer = asObject<{
        legal?: string;
        owner?: string;
        copyright?: string;
        credit?: string;
      }>((row as { footer?: unknown }).footer);
      return {
        footerLegal: footer.legal,
        footerOwner: footer.owner,
        footerCopyright: footer.copyright,
        footerCredit: footer.credit,
      };
    })(),
  };
}
