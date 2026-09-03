import { z } from "zod";

const disciplines = [
  "art",
  "architecture",
  "interior",
  "production-design",
  "film",
  "spatial-design",
  "photography",
  "experimental",
  "graphic",
  "other",
] as const;

const nullableString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length ? v : null));

/** Empty form fields arrive as "" — treat them as "not provided". */
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().optional(),
);
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().min(0).optional(),
);
const requiredInt = (fallback: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? fallback : v),
    z.coerce.number().int(),
  );

export const workSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ?? "").replace(/[^a-z0-9-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase()),
  year: nullableString,
  yearSort: optionalInt,
  discipline: z.enum(disciplines),
  kind: nullableString,
  medium: nullableString,
  dimensions: nullableString,
  client: nullableString,
  location: nullableString,
  role: nullableString,
  summary: z.string().trim().min(4).max(400),
  description: z.string().trim().max(8000).optional().default(""),
  statement: nullableString,
  concept: nullableString,
  process: nullableString,
  collectionSlug: nullableString,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  availability: z
    .enum(["available", "sold", "on-hold", "not-for-sale", "enquire"])
    .default("enquire"),
  price: optionalNumber,
  currency: z.string().trim().min(1).max(4).default("INR"),
  priceVisible: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().default(false),
  sortOrder: requiredInt(100),
  coverImage: z.string().trim().optional().default(""),
  accent: z
    .string()
    .trim()
    .regex(/^#?[0-9a-fA-F]{6}$/, "A 6-digit hex colour")
    .nullable()
    .optional()
    .or(z.literal("")),
  seoTitle: nullableString,
  seoDescription: nullableString,
  ogImage: nullableString,
  relatedSlugs: z.string().trim().optional().default(""),
});

export type WorkFormInput = z.infer<typeof workSchema>;

export const collectionSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ?? "").replace(/[^a-z0-9-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase()),
  description: z.string().trim().min(4).max(2000),
  period: nullableString,
  coverImage: nullableString,
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
  sortOrder: requiredInt(100),
});

export const exhibitionSchema = z.object({
  title: z.string().trim().min(2).max(200),
  year: z.string().trim().regex(/^\d{4}$/, "A four-digit year"),
  venue: z.string().trim().min(2).max(200),
  city: nullableString,
  country: nullableString,
  type: z.enum([
    "solo",
    "group",
    "exhibition",
    "screening",
    "installation",
    "residency",
    "commission",
    "publication",
  ]),
  dateLabel: nullableString,
  description: nullableString,
  url: z.string().trim().url().nullable().optional().or(z.literal("")),
  published: z.coerce.boolean().default(true),
  sortOrder: requiredInt(100),
  relatedSlugs: z.string().trim().optional().default(""),
});

export const timelineSchema = z.object({
  year: z.string().trim().min(2).max(24),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(4).max(2000),
  image: nullableString,
  category: nullableString,
  sortOrder: requiredInt(100),
  published: z.coerce.boolean().default(true),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  roles: z.string().trim().min(2),
  headline: z.string().trim().min(4).max(400),
  statement: z.string().trim().min(4).max(600),
  bio: z.string().trim().min(4).max(8000),
  email: z.string().trim().email(),
  phone: z.string().trim().min(4).max(40),
  whatsapp: z.string().trim().regex(/^\d{8,15}$/, "Digits only, with country code"),
  location: z.string().trim().min(2).max(120),
  portrait: nullableString,
});

export const settingsSchema = z.object({
  brand: z.string().trim().min(2).max(120),
  brandLine: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(200),
  heroHeading: z.string().trim().min(4).max(300),
  heroEyebrow: z.string().trim().min(2).max(160),
  heroSupporting: z.string().trim().min(4).max(600),
  heroCtaLabel: z.string().trim().min(2).max(60),
  heroCtaHref: z.string().trim().min(1).max(200),
  heroWorkSlug: nullableString,
  footerNote: z.string().trim().min(4).max(600),
  contactHeading: z.string().trim().min(2).max(200),
  contactSupporting: z.string().trim().min(4).max(600),
  seoDefaultTitle: z.string().trim().min(2).max(160),
  seoDescription: z.string().trim().min(10).max(400),
});
