import type { HomeContent } from "@/lib/types";

/**
 * Default editable content for the home page. Every value here is the copy
 * that was previously hardcoded in `app/(site)/page.tsx`,
 * `components/home/*` and `components/timeline/timeline.tsx` (TimelineStrip).
 * With nothing saved to `pages.content`, the page renders identically.
 */
export const homeDefaults: HomeContent = {
  order: [
    "intro",
    "featured",
    "disciplines",
    "timeline",
    "studioPreview",
    "collections",
    "contactCta",
  ],
  hidden: [],

  intro: {
    eyebrow: "The practice",
    linkLabel: "Read the full story",
  },

  featured: {
    eyebrow: "Selected work",
    heading: "A few pieces to begin with",
    linkLabel: "All work",
  },

  disciplines: {
    eyebrow: "Across disciplines",
    heading: "Different mediums, the same question.",
    body: "What to do with the ruin, the eco-void, the monument — how to hold a place rather than erase it. The answer arrives as a building, a miniature, a render, or a title card.",
    blurbs: {
      architecture:
        "Built and speculative — a house that breathes, a tower over a ruin, a black marble monument to love.",
      "production-design":
        "Title cards, first-look posters and character design for Kannada cinema and a Prime Original.",
      photography:
        "Miniatures and conservation workers, shot until the seam between model and world disappears.",
      experimental:
        "Plaster cities, a pierced tin can as architecture, an infotech flush plate that pays you back.",
      art: "An abstract Shiva from a blue cosmos; an entire seascape in four lines.",
      graphic: "Marks and identities folded back into Indian myth.",
    },
  },

  timeline: {
    eyebrow: "Origin",
    heading: "From drawing mythology to the edge of fiction.",
    body: "A visual autobiography that runs from 1995 to 2017 — art, then science, then the discovery that architecture could hold both.",
    linkLabel: "Walk through the timeline",
  },

  studioPreview: {
    eyebrow: "Studio & process",
    heading: "Built at the scale\nof a table.",
    body: "Plaster of Paris, box board, a piece of mirror for water, fern for a forest — then photographed at eye level until the model becomes a world. And sometimes, built at full scale.",
    linkLabel: "Enter the studio",
  },

  collections: {
    eyebrow: "Series",
    heading: "Bodies of work",
    linkLabel: "All work",
  },

  contactCta: {
    eyebrow: "Contact",
    ctaLabel: "Start an enquiry",
  },
};
