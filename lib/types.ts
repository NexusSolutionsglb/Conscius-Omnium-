/**
 * Domain model for Conscious Omnium.
 *
 * One primary content entity — `Work` — spans every discipline in
 * Shivjeet's practice (art, architecture, production design, film…).
 * This mirrors the portfolio itself, where a plaster miniature, a
 * feature-film title card and a built pavilion sit side by side.
 * `discipline` + `kind` carry the nuance the spec asked for without
 * forcing everything into "Artwork".
 */

export type Discipline =
  | "art"
  | "architecture"
  | "interior"
  | "production-design"
  | "film"
  | "spatial-design"
  | "photography"
  | "experimental"
  | "graphic"
  | "other";

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  art: "Art",
  architecture: "Architecture",
  interior: "Interior",
  "production-design": "Production Design",
  film: "Film",
  "spatial-design": "Spatial Design",
  photography: "Photography",
  experimental: "Experimental",
  graphic: "Graphic & Identity",
  other: "Other",
};

export type WorkStatus = "draft" | "published" | "archived";

export type Availability =
  | "available"
  | "sold"
  | "on-hold"
  | "not-for-sale"
  | "enquire";

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: "Available",
  sold: "Sold",
  "on-hold": "On hold",
  "not-for-sale": "Not for sale",
  enquire: "Enquire",
};

export type ImageKind =
  | "cover"
  | "gallery"
  | "detail"
  | "installation"
  | "process"
  | "drawing"
  | "render";

export interface WorkImage {
  id: string;
  url: string;
  alt: string;
  kind: ImageKind;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
}

export interface SeoFields {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
}

export interface Work {
  id: string;
  slug: string;
  title: string;
  year: string | null;
  yearSort: number | null;
  discipline: Discipline;
  /** Free-text sub-classification, e.g. "Miniature & photography". */
  kind?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  client?: string | null;
  location?: string | null;
  role?: string | null;
  /** One-line editorial caption used in indexes. */
  summary: string;
  /** Long description — array of paragraphs. */
  description: string[];
  /** The artist's statement for this work — set in an editorial italic. */
  statement?: string | null;
  concept?: string | null;
  process?: string | null;
  credits?: { role: string; name: string }[];
  collectionSlug?: string | null;
  status: WorkStatus;
  availability: Availability;
  price?: number | null;
  currency?: string;
  priceVisible: boolean;
  featured: boolean;
  sortOrder: number;
  coverImage: string;
  /** Optional artwork-derived accent colour (hex). */
  accent?: string | null;
  images: WorkImage[];
  relatedSlugs?: string[];
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  period?: string | null;
  coverImage?: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export type ExhibitionType =
  | "solo"
  | "group"
  | "exhibition"
  | "screening"
  | "installation"
  | "residency"
  | "commission"
  | "publication";

export interface Exhibition {
  id: string;
  title: string;
  year: string;
  venue: string;
  city?: string | null;
  country?: string | null;
  type: ExhibitionType;
  dateLabel?: string | null;
  description?: string | null;
  url?: string | null;
  published: boolean;
  sortOrder: number;
  relatedSlugs?: string[];
}

export interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string | null;
  category?: string | null;
  sortOrder: number;
  published: boolean;
}

/** A managed block of body content on a static-ish page. */
export interface PageSection {
  id: string;
  eyebrow?: string | null;
  heading?: string | null;
  body?: string[];
  image?: string | null;
  caption?: string | null;
  layout?: "text" | "image-left" | "image-right" | "full-image" | "quote";
}

export interface ManagedPage {
  slug: "about" | "studio" | "contact";
  title: string;
  intro?: string | null;
  sections: PageSection[];
  seo?: SeoFields;
}

export interface Profile {
  name: string;
  roles: string[];
  headline: string;
  statement: string;
  bio: string[];
  education: { qualification: string; institution: string; detail?: string }[];
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  portrait?: string | null;
  social: { label: string; href: string }[];
}

export interface HeroConfig {
  eyebrow: string;
  heading: string;
  supporting: string;
  ctaLabel: string;
  ctaHref: string;
  /** Slug of the Work whose cover fills the hero. */
  workSlug: string | null;
  /** Fallback / override image if no work is chosen. */
  image?: string | null;
  showMeta: boolean;
}

export interface SiteSettings {
  brand: string;
  brandLine: string;
  tagline: string;
  nav: { label: string; href: string }[];
  hero: HeroConfig;
  footerNote: string;
  contactCopy: { heading: string; supporting: string };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    description: string;
    ogImage: string;
  };
}

export type InquiryType =
  | "purchase"
  | "availability"
  | "commission"
  | "exhibition"
  | "collaboration"
  | "press"
  | "general";

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  purchase: "Artwork purchase",
  availability: "Artwork availability",
  commission: "Commission",
  exhibition: "Exhibition",
  collaboration: "Collaboration",
  press: "Press & media",
  general: "General enquiry",
};

export type InquiryStatus =
  | "new"
  | "read"
  | "in-progress"
  | "responded"
  | "closed"
  | "archived";

export interface InquiryNote {
  id: string;
  body: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  type: InquiryType;
  message: string;
  budget?: string | null;
  preferredContact?: "email" | "phone" | "whatsapp" | null;
  workSlug?: string | null;
  workTitle?: string | null;
  status: InquiryStatus;
  notes: InquiryNote[];
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  url: string;
  alt?: string | null;
  folder: string;
  width?: number | null;
  height?: number | null;
  size?: number | null;
  contentType?: string | null;
  createdAt: string;
}
