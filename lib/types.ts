/**
 * Domain model for Conscius Omnium.
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
  /** The artist's own address. Kept private-ish: the site publishes the three
   *  purpose-specific addresses below instead. */
  email: string;
  /** Enquiries, commissions and bookings — the contact form's inbox. */
  enquiryEmail?: string | null;
  /** General information — footer, about, legal pages, structured data. */
  infoEmail?: string | null;
  /** Studio, services and project correspondence. */
  studioEmail?: string | null;
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
  /** Full-bleed background video (muted/looped); falls back to a plain
   *  colour field when unset. */
  video?: string | null;
  showMeta: boolean;
}

export interface SiteSettings {
  brand: string;
  brandLine: string;
  tagline: string;
  /** Wordmark image shown over a light/solid header — falls back to the
   *  text `brand` when unset. */
  logo?: string | null;
  /** Wordmark image shown over a dark/transparent header (e.g. the hero). */
  logoInverted?: string | null;
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
  /** Editable theme overrides — empty object means "use the stylesheet defaults". */
  theme?: ThemeTokens;
  /** Footer legal / attribution text (editable; blank ⇒ hidden). */
  footerLegal?: string;
  footerOwner?: string;
  /** Footer copyright line — `{year}` / `{brand}` tokens substituted. */
  footerCopyright?: string;
  /** Footer studio-credit line — `{name}` / `{roles}` tokens substituted. */
  footerCredit?: string;
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

/** Which form an enquiry came from — shown in the internal notification. */
export type InquirySource =
  | "contact-page"
  | "work-enquiry"
  | "collection-enquiry"
  | "api";

export const INQUIRY_SOURCE_LABELS: Record<InquirySource, string> = {
  "contact-page": "Contact page form",
  "work-enquiry": "Artwork enquiry dialog",
  "collection-enquiry": "Collection enquiry",
  api: "API / direct submission",
};

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
  /** The form this arrived through. */
  source?: InquirySource | null;
  status: InquiryStatus;
  notes: InquiryNote[];
  createdAt: string;
}

/* ─── newsletter ────────────────────────────────────────────────── */

export type SubscriberStatus = "subscribed" | "unsubscribed";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string | null;
  status: SubscriberStatus;
  /** Where they signed up — footer, contact page, admin import… */
  source?: string | null;
  subscribedAt: string;
  unsubscribedAt?: string | null;
  createdAt: string;
}

export type CampaignStatus = "draft" | "sent";

/** One block of a newsletter issue. `heading` is optional; `body` is prose. */
export interface CampaignSection {
  id: string;
  heading?: string | null;
  body: string;
  imageUrl?: string | null;
  imageCaption?: string | null;
  linkLabel?: string | null;
  linkHref?: string | null;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  /** Inbox preview line. */
  preheader?: string | null;
  intro?: string | null;
  sections: CampaignSection[];
  ctaLabel?: string | null;
  ctaHref?: string | null;
  status: CampaignStatus;
  sentAt?: string | null;
  sentCount: number;
  failedCount: number;
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

/* ═══════════════════════════════════════════════════════════════════
   Visual editor — per-page editable content
   ───────────────────────────────────────────────────────────────────
   Each page stores a typed `content` object in `pages.content`. Every
   field has a default (see lib/content/defaults/*) equal to the copy
   that used to be hardcoded, so an unset/partial value renders exactly
   as before. Route files own layout + animation; the editor only
   changes these values and section order.
   ═══════════════════════════════════════════════════════════════════ */

export type SectionBackground = "default" | "paper" | "paper-dim" | "obsidian";
export type SectionSpacing = "default" | "tight" | "normal" | "spacious";

export interface EditableLink {
  label: string;
  href: string;
}

/* ── Custom blocks — new section types the admin can add anywhere ── */

export interface BlockBase {
  background?: SectionBackground;
  spacing?: SectionSpacing;
}
export interface RichTextBlock extends BlockBase {
  type: "richText";
  eyebrow: string;
  heading: string;
  body: string;
}
export interface ImageBlock extends BlockBase {
  type: "image";
  image: string | null;
  caption: string;
  full: boolean;
}
export interface QuoteBlock extends BlockBase {
  type: "quote";
  text: string;
  attribution: string;
}
export interface CtaBlock extends BlockBase {
  type: "cta";
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}
export interface GalleryBlock extends BlockBase {
  type: "gallery";
  images: { url: string; alt: string }[];
}
export type CustomBlock =
  | RichTextBlock
  | ImageBlock
  | QuoteBlock
  | CtaBlock
  | GalleryBlock;
export type CustomBlockType = CustomBlock["type"];

export type HomeSectionKey =
  | "intro"
  | "featured"
  | "studioPreview"
  | "collections"
  | "contactCta";

export interface HomeContent {
  /** Post-hero sections, in render order. Entries are `HomeSectionKey` or
   *  `block:<id>` for an admin-added custom block. */
  order: (HomeSectionKey | string)[];
  /** Sections hidden without being deleted. */
  hidden: (HomeSectionKey | string)[];
  /** Optional per-section background / spacing overrides, keyed like `order`. */
  sectionStyles?: Record<string, BlockBase>;
  /** Admin-added custom blocks, keyed by id. */
  blocks?: Record<string, CustomBlock>;
  intro: { eyebrow: string; linkLabel: string };
  featured: { eyebrow: string; heading: string; linkLabel: string };
  disciplines: {
    eyebrow: string;
    heading: string;
    body: string;
    /** Per-discipline blurb shown under each card. */
    blurbs: Partial<Record<Discipline, string>>;
  };
  timeline: { eyebrow: string; heading: string; body: string; linkLabel: string };
  studioPreview: {
    eyebrow: string;
    /** `\n` becomes a line break. */
    heading: string;
    body: string;
    linkLabel: string;
    /** Explicit image; when empty the home page falls back to a studio work's cover. */
    image: string | null;
  };
  collections: { eyebrow: string; heading: string; linkLabel: string };
  contactCta: { eyebrow: string; ctaLabel: string };
}

/** Shared copy shapes. `heading` fields may contain `\n` for a line break. */
export interface PageHeroCopy {
  eyebrow: string;
  heading: string;
}
export interface PageCtaCopy {
  eyebrow: string;
  heading: string;
  linkLabel: string;
  /** Optional lead-in for a contact address shown beneath the CTA. */
  contactLabel?: string;
}

export interface AboutBodySection {
  id: string;
  eyebrow: string;
  heading: string;
  /** One string per paragraph. */
  body: string[];
}

export interface AboutContent {
  heroEyebrow: string;
  intro: string;
  portraitFallbackCaption: string;
  body: AboutBodySection[];
  educationEyebrow: string;
  timeline: { eyebrow: string; heading: string; body: string; stripLabel: string };
  nextCta: PageCtaCopy;
}

export interface StudioBodySection {
  id: string;
  eyebrow: string;
  heading: string;
  body: string[];
  image: string | null;
  caption: string | null;
  layout: "image-left" | "image-right";
}

export interface StudioContent {
  hero: PageHeroCopy;
  intro: string;
  body: StudioBodySection[];
  endCta: PageCtaCopy;
}

export interface WorkIndexContent {
  eyebrow: string;
  heading: string;
  /** `{count}` is replaced with the number of published works. */
  intro: string;
}

export interface ExhibitionsContent {
  hero: { eyebrow: string; heading: string; intro: string };
  listEyebrow: string;
  listEmpty: string;
  /** `body` supports `*emphasis*` markers, rendered as `<em>`. */
  onScreen: { eyebrow: string; heading: string; body: string };
  trainingEyebrow: string;
  endCtaLabel: string;
}

export interface ContactContent {
  eyebrow: string;
  formEyebrow: string;
  /** WhatsApp button label */
  whatsappLabel: string;
  /** Contact-detail row labels — one per purpose-specific address */
  enquiryEmailLabel: string;
  infoEmailLabel: string;
  studioEmailLabel: string;
  phoneLabel: string;
  whatsappRowLabel: string;
  locationLabel: string;
  /** Text of the WhatsApp detail row value */
  messageStudio: string;
}

/**
 * Editable theme tokens. Every field is optional — an unset field keeps the
 * built-in value from `app/globals.css`. Applied as a `:root { … }` override.
 */
export interface ThemeTokens {
  colorPaper?: string;
  colorInk?: string;
  colorInkSoft?: string;
  colorInkMute?: string;
  colorAccent?: string;
  colorAccentDeep?: string;
  /** Font family for display/headings. One of the curated `FONT_CHOICES`. */
  fontDisplay?: string;
  /** Font family for body/UI text. One of the curated `FONT_CHOICES`. */
  fontSans?: string;
  /** Overall type-scale multiplier, 0.85–1.2. */
  typeScale?: number;
  /** Max content width in px. */
  containerWidth?: number;
}

/** Map of every page slug the visual editor manages to its content shape. */
export interface PageContentMap {
  home: HomeContent;
  about: AboutContent;
  studio: StudioContent;
  work: WorkIndexContent;
  exhibitions: ExhibitionsContent;
  contact: ContactContent;
}

/**
 * A Series as the gallery presents it: the collection record plus every
 * published artwork that belongs to it. `Gallery → Series → Artworks →
 * Artwork detail` is the site's whole navigation spine, so the shape the
 * pages consume is defined once, here.
 */
export interface Series extends Collection {
  works: Work[];
  /** The plate shown on the series card — the collection cover if one is
   *  set, otherwise the first artwork's cover. */
  plateImage: string | null;
}
