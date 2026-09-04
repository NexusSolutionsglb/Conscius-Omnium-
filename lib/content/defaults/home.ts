import type { HomeContent } from "@/lib/types";

/**
 * Default editable content for the home page. Every value here is the copy
 * that was previously hardcoded in `app/(site)/page.tsx`,
 * `components/home/*` and `components/timeline/timeline.tsx` (TimelineStrip).
 * With nothing saved to `pages.content`, the page renders identically.
 */
export const homeDefaults: HomeContent = {
  order: ["intro", "featured", "studioPreview", "collections", "contactCta"],
  hidden: [],
  sectionStyles: {},
  blocks: {},

  intro: {
    eyebrow: "The practice",
    linkLabel: "Read the full story",
  },

  featured: {
    eyebrow: "Selected work",
    heading: "A few pieces to begin with",
    linkLabel: "The full gallery",
  },

  disciplines: {
    eyebrow: "",
    heading: "",
    body: "",
    blurbs: {},
  },

  timeline: {
    eyebrow: "",
    heading: "",
    body: "",
    linkLabel: "",
  },

  studioPreview: {
    eyebrow: "Studio & process",
    heading: "Built at the scale\nof a table.",
    body: "Plaster of Paris, box board, a piece of mirror for water, fern for a forest — then photographed at eye level until the model becomes a world. And sometimes, built at full scale.",
    linkLabel: "Enter the studio",
    image: null,
  },

  collections: {
    eyebrow: "Series",
    heading: "Bodies of work",
    linkLabel: "The full gallery",
  },

  contactCta: {
    eyebrow: "Contact",
    ctaLabel: "Start an enquiry",
  },
};
