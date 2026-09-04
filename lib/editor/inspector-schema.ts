import {
  AVAILABILITY_LABELS,
  DISCIPLINE_LABELS,
  type Discipline,
} from "@/lib/types";
import { BACKGROUND_OPTIONS, SPACING_OPTIONS } from "./section-style";

/**
 * Field-driven inspector. A `data-edit-kind` on a section / item / node wrapper
 * names one of these schemas; `data-edit-bind` gives the snapshot path its
 * fields are relative to (e.g. `@settings.hero`, `@works.3`, `@collections.0`).
 * The inspector renders one control per field and writes straight to the store,
 * so every record is fully editable on the page — no separate admin form.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "paragraphs" // string[] <-> textarea split on blank lines
  | "link"
  | "image"
  | "gallery" // WorkImage[] — full add / remove / reorder / per-image fields
  | "select"
  | "toggle"
  | "color"
  | "number";

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  /** upload folder for `image` fields */
  folder?: string;
  /** static options for `select` */
  options?: { value: string; label: string }[];
  /** dynamic options pulled from the live snapshot */
  optionsFrom?: "works" | "collections";
  /** `select` may resolve to `null` (stored) when the empty option is chosen */
  nullable?: boolean;
  placeholder?: string;
  rows?: number;
  help?: string;
}

export interface InspectorSchema {
  title: string;
  fields: FieldSpec[];
}

const disciplineOptions = (Object.keys(DISCIPLINE_LABELS) as Discipline[]).map(
  (d) => ({ value: d, label: DISCIPLINE_LABELS[d] }),
);

const availabilityOptions = (
  Object.keys(AVAILABILITY_LABELS) as (keyof typeof AVAILABILITY_LABELS)[]
).map((a) => ({ value: a, label: AVAILABILITY_LABELS[a] }));

const statusOptions = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const exhibitionTypeOptions = [
  "solo",
  "group",
  "exhibition",
  "screening",
  "installation",
  "residency",
  "commission",
  "publication",
].map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));

export const INSPECTOR_SCHEMAS: Record<string, InspectorSchema> = {
  hero: {
    title: "Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "textarea", rows: 2, help: "One line break allowed." },
      { key: "ctaLabel", label: "Button label", type: "text" },
      { key: "ctaHref", label: "Button link", type: "link" },
      {
        key: "workSlug",
        label: "Featured work",
        type: "select",
        optionsFrom: "works",
        nullable: true,
        help: "Its cover fills the hero. Leave as “None” to use the image below.",
      },
      { key: "image", label: "Fallback / custom image", type: "image", folder: "hero" },
      { key: "showMeta", label: "Show work caption", type: "toggle" },
    ],
  },

  work: {
    title: "Work",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug", type: "text" },
      { key: "coverImage", label: "Cover image", type: "image", folder: "work" },
      { key: "year", label: "Year", type: "text" },
      { key: "discipline", label: "Discipline", type: "select", options: disciplineOptions },
      { key: "kind", label: "Kind", type: "text", placeholder: "e.g. Miniature & photography" },
      { key: "medium", label: "Medium", type: "text" },
      { key: "dimensions", label: "Dimensions", type: "text" },
      { key: "summary", label: "One-line summary", type: "textarea", rows: 2 },
      { key: "description", label: "Description", type: "paragraphs", rows: 6 },
      { key: "statement", label: "Artist statement", type: "textarea", rows: 3 },
      { key: "concept", label: "Concept", type: "textarea", rows: 3 },
      { key: "process", label: "Process", type: "textarea", rows: 3 },
      { key: "client", label: "Client", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "role", label: "Role", type: "text" },
      {
        key: "collectionSlug",
        label: "Collection / series",
        type: "select",
        optionsFrom: "collections",
        nullable: true,
      },
      { key: "status", label: "Status", type: "select", options: statusOptions },
      { key: "availability", label: "Availability", type: "select", options: availabilityOptions },
      { key: "price", label: "Price", type: "number" },
      { key: "priceVisible", label: "Show price", type: "toggle" },
      { key: "featured", label: "Featured", type: "toggle" },
      { key: "accent", label: "Accent colour", type: "color" },
      { key: "images", label: "Gallery", type: "gallery", folder: "work" },
    ],
  },

  collection: {
    title: "Collection",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug", type: "text" },
      { key: "coverImage", label: "Cover image", type: "image", folder: "collection" },
      { key: "description", label: "Description", type: "textarea", rows: 4 },
      { key: "period", label: "Period", type: "text", placeholder: "e.g. 2014–2017" },
      { key: "featured", label: "Featured", type: "toggle" },
      { key: "published", label: "Published (visible)", type: "toggle" },
    ],
  },

  exhibition: {
    title: "Exhibition",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "venue", label: "Venue", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "type", label: "Type", type: "select", options: exhibitionTypeOptions },
      { key: "dateLabel", label: "Date label", type: "text" },
      { key: "description", label: "Description", type: "textarea", rows: 4 },
      { key: "url", label: "External link", type: "link" },
      { key: "published", label: "Published (visible)", type: "toggle" },
    ],
  },

  timeline: {
    title: "Timeline entry",
    fields: [
      { key: "year", label: "Year", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea", rows: 3 },
      { key: "image", label: "Image", type: "image", folder: "timeline" },
      { key: "category", label: "Category", type: "text" },
      { key: "published", label: "Published (visible)", type: "toggle" },
    ],
  },

  social: {
    title: "Social link",
    fields: [
      { key: "label", label: "Label", type: "text", placeholder: "Instagram" },
      { key: "href", label: "URL", type: "link", placeholder: "https://instagram.com/…" },
    ],
  },

  education: {
    title: "Education",
    fields: [
      { key: "qualification", label: "Qualification", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      { key: "detail", label: "Detail", type: "text" },
    ],
  },
};

/* ── custom section blocks ── */

const APPEARANCE: FieldSpec[] = [
  {
    key: "background",
    label: "Background",
    type: "select",
    options: BACKGROUND_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
  {
    key: "spacing",
    label: "Vertical spacing",
    type: "select",
    options: SPACING_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
];

export const BLOCK_SCHEMAS: Record<string, InspectorSchema> = {
  "block-richText": {
    title: "Text block",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea", rows: 5 },
      ...APPEARANCE,
    ],
  },
  "block-image": {
    title: "Image block",
    fields: [
      { key: "image", label: "Image", type: "image", folder: "media" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "full", label: "Full width", type: "toggle" },
      ...APPEARANCE,
    ],
  },
  "block-quote": {
    title: "Pull quote",
    fields: [
      { key: "text", label: "Quote", type: "textarea", rows: 3 },
      { key: "attribution", label: "Attribution", type: "text" },
      ...APPEARANCE,
    ],
  },
  "block-cta": {
    title: "Call to action",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Supporting text", type: "textarea", rows: 2 },
      { key: "ctaLabel", label: "Button label", type: "text" },
      { key: "ctaHref", label: "Button link", type: "link" },
      ...APPEARANCE,
    ],
  },
  "block-gallery": {
    title: "Image gallery",
    fields: [
      { key: "images", label: "Images", type: "gallery", folder: "media" },
      ...APPEARANCE,
    ],
  },
};

/** Just the background + spacing controls, for the built-in sections. */
export const APPEARANCE_SCHEMA: InspectorSchema = {
  title: "Appearance",
  fields: APPEARANCE,
};

export function getSchema(kind: string | undefined): InspectorSchema | null {
  if (!kind) return null;
  return INSPECTOR_SCHEMAS[kind] ?? BLOCK_SCHEMAS[kind] ?? null;
}
