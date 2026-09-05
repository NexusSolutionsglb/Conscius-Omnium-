/**
 * Hand-authored to match `supabase/migrations/0001_init.sql`.
 * Regenerate with `supabase gen types typescript --local` once the CLI
 * is wired up; kept in sync manually here so the app type-checks with
 * zero external setup.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
}

export type WorkRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  year: string | null;
  year_sort: number | null;
  discipline: string;
  kind: string | null;
  medium: string | null;
  dimensions: string | null;
  client: string | null;
  location: string | null;
  role: string | null;
  summary: string;
  description: Json;
  statement: string | null;
  concept: string | null;
  process: string | null;
  credits: Json;
  collection_slug: string | null;
  status: string;
  availability: string;
  price: number | null;
  currency: string;
  price_visible: boolean;
  featured: boolean;
  sort_order: number;
  cover_image: string;
  accent: string | null;
  images: Json;
  related_slugs: Json;
  seo: Json;
  published_at: string | null;
}

export type WorkImageRow = Timestamps & {
  id: string;
  work_id: string;
  url: string;
  alt: string;
  kind: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export type CollectionRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  description: string;
  period: string | null;
  cover_image: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export type ExhibitionRow = Timestamps & {
  id: string;
  title: string;
  year: string;
  venue: string;
  city: string | null;
  country: string | null;
  type: string;
  date_label: string | null;
  description: string | null;
  url: string | null;
  published: boolean;
  sort_order: number;
  related_slugs: Json;
}

export type TimelineRow = Timestamps & {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string | null;
  category: string | null;
  sort_order: number;
  published: boolean;
}

export type PageRow = Timestamps & {
  slug: string;
  title: string;
  intro: string | null;
  sections: Json;
  /** Typed editable content for the visual editor (added in 0002). */
  content: Json;
  seo: Json;
}

export type ProfileRow = Timestamps & {
  id: string;
  name: string;
  roles: Json;
  headline: string;
  statement: string;
  bio: Json;
  education: Json;
  email: string;
  /** Purpose-specific addresses (added in 0004) — absent on older databases. */
  enquiry_email?: string | null;
  info_email?: string | null;
  studio_email?: string | null;
  phone: string;
  whatsapp: string;
  location: string;
  portrait: string | null;
  social: Json;
}

export type SiteSettingsRow = Timestamps & {
  id: string;
  brand: string;
  brand_line: string;
  tagline: string;
  nav: Json;
  hero: Json;
  footer_note: string;
  contact_copy: Json;
  seo: Json;
  /** Editable theme tokens / chrome overrides (added in 0003). */
  theme: Json;
  header: Json;
  footer: Json;
}

export type InquiryRow = {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  type: string;
  message: string;
  budget: string | null;
  preferred_contact: string | null;
  work_slug: string | null;
  work_title: string | null;
  /** Which form the enquiry came from (added in 0005). */
  source?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type InquiryNoteRow = {
  id: string;
  inquiry_id: string;
  body: string;
  created_at: string;
}

export type MediaRow = {
  id: string;
  bucket: string;
  path: string;
  url: string;
  alt: string | null;
  folder: string;
  width: number | null;
  height: number | null;
  size: number | null;
  content_type: string | null;
  created_at: string;
}

/**
 * `& Record<string, unknown>` gives each shape the implicit index
 * signature postgrest-js's `GenericTable` requires — mapped types like
 * `Partial<Row>` don't get one on their own. Insert/Update stay as plain
 * partials so excess-property checks on writes still work.
 */
type Indexed<T> = T & Record<string, unknown>;
export type NewsletterSubscriberRow = Timestamps & {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export type NewsletterCampaignRow = Timestamps & {
  id: string;
  subject: string;
  preheader: string | null;
  intro: string | null;
  body: Json;
  cta_label: string | null;
  cta_href: string | null;
  status: string;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
}

type TableShape<Row> = {
  Row: Indexed<Row>;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row> & Record<string, unknown>;
  Relationships: [];
};

type Empty = Record<never, never>;

export interface Database {
  public: {
    Tables: {
      works: TableShape<WorkRow>;
      work_images: TableShape<WorkImageRow>;
      collections: TableShape<CollectionRow>;
      exhibitions: TableShape<ExhibitionRow>;
      timeline_entries: TableShape<TimelineRow>;
      pages: TableShape<PageRow>;
      profile: TableShape<ProfileRow>;
      site_settings: TableShape<SiteSettingsRow>;
      inquiries: TableShape<InquiryRow>;
      inquiry_notes: TableShape<InquiryNoteRow>;
      media: TableShape<MediaRow>;
      newsletter_subscribers: TableShape<NewsletterSubscriberRow>;
      newsletter_campaigns: TableShape<NewsletterCampaignRow>;
    };
    Views: Empty;
    Functions: {
      /** Upserts a subscriber; reports whether this was new, a return, or a repeat. */
      newsletter_subscribe: {
        Args: { p_email: string; p_name?: string | null; p_source?: string | null };
        Returns: { outcome: string; token: string }[];
      };
      newsletter_unsubscribe: {
        Args: { p_token: string };
        Returns: { outcome: string; email: string | null }[];
      };
    };
    Enums: Empty;
    CompositeTypes: Empty;
  };
}
