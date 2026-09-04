import type {
  Collection,
  CustomBlock,
  CustomBlockType,
  Exhibition,
  Profile,
  TimelineEntry,
  Work,
  WorkImage,
} from "@/lib/types";

/**
 * Factories for brand-new records added from the visual editor. The `tmp-…`
 * id marks them as inserts for `publishSite` (`isRealId` rejects it, so the id
 * is stripped and the row is inserted).
 */

const tmpId = () => `tmp-${Math.random().toString(36).slice(2, 10)}`;
const stamp = () => Date.now().toString(36);

export function newWork(overrides: Partial<Work> = {}): Work {
  const year = new Date().getFullYear();
  return {
    id: tmpId(),
    slug: `work-${stamp()}`,
    title: "Untitled work",
    year: String(year),
    yearSort: year,
    discipline: "other",
    kind: null,
    medium: null,
    dimensions: null,
    client: null,
    location: null,
    role: null,
    summary: "",
    description: [],
    statement: null,
    concept: null,
    process: null,
    credits: [],
    collectionSlug: null,
    status: "draft",
    availability: "enquire",
    price: null,
    currency: "INR",
    priceVisible: false,
    featured: false,
    sortOrder: 999,
    coverImage: "",
    accent: null,
    images: [],
    relatedSlugs: [],
    seo: {},
    ...overrides,
  };
}

export function newWorkImage(url = ""): WorkImage {
  return { id: tmpId(), url, alt: "", kind: "gallery", caption: "", sortOrder: 0 };
}

export function newCollection(): Collection {
  return {
    id: tmpId(),
    slug: `series-${stamp()}`,
    title: "New series",
    description: "Describe this body of work.",
    period: null,
    coverImage: null,
    featured: false,
    published: true,
    sortOrder: 999,
  };
}

export function newExhibition(): Exhibition {
  return {
    id: tmpId(),
    title: "New exhibition",
    year: String(new Date().getFullYear()),
    venue: "Venue",
    city: null,
    country: null,
    type: "exhibition",
    dateLabel: null,
    description: null,
    url: null,
    published: true,
    sortOrder: 999,
    relatedSlugs: [],
  };
}

export function newTimelineEntry(): TimelineEntry {
  return {
    id: tmpId(),
    year: String(new Date().getFullYear()),
    title: "New moment",
    description: "What happened, and why it mattered.",
    image: null,
    category: null,
    sortOrder: 999,
    published: true,
  };
}

export function newEducation(): Profile["education"][number] {
  return { qualification: "Qualification", institution: "Institution" };
}

export function newSocial(): Profile["social"][number] {
  return { label: "Instagram", href: "https://" };
}

/** A fresh custom block of the given type, with placeholder copy. */
export function newBlock(type: CustomBlockType): CustomBlock {
  switch (type) {
    case "richText":
      return {
        type,
        eyebrow: "Section",
        heading: "A new section",
        body: "Write something here. This block can be moved, styled, duplicated or removed.",
      };
    case "image":
      return { type, image: null, caption: "", full: false };
    case "quote":
      return { type, text: "A line worth setting large.", attribution: "Attribution" };
    case "cta":
      return {
        type,
        eyebrow: "Next",
        heading: "A call to action",
        body: "One line of supporting text.",
        ctaLabel: "Get in touch",
        ctaHref: "/contact",
      };
    case "gallery":
      return { type, images: [] };
  }
}

export const BLOCK_LABELS: Record<CustomBlockType, string> = {
  richText: "Text block",
  image: "Image",
  quote: "Pull quote",
  cta: "Call to action",
  gallery: "Image gallery",
};

export function blockId() {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}
