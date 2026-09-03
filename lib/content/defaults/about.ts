import type { AboutContent } from "@/lib/types";
import { pagesSeed } from "@/lib/content/pages";

const seed = pagesSeed.find((p) => p.slug === "about");

/** Default editable copy for `/about` — verbatim from `app/(site)/about/page.tsx`
 *  and the bundled `pagesSeed`. */
export const aboutDefaults: AboutContent = {
  heroEyebrow: "About",
  intro:
    seed?.intro ??
    "Shivjeet Potdar is an architect, interior and production designer, and filmmaker. The practice moves between built space, the photographed miniature, the render and the screen.",
  portraitFallbackCaption: "Portrait to be added via Admin",
  body: (seed?.sections ?? []).map((s) => ({
    id: s.id,
    eyebrow: s.eyebrow ?? "",
    heading: s.heading ?? "",
    body: s.body ?? [],
  })),
  educationEyebrow: "Education",
  timeline: {
    eyebrow: "His story",
    heading: "A visual autobiography, 1995–2017.",
    body: "Drawing mythology, then wanting to be an artist, then a scientist, then finding that architecture could hold both — and finally moving toward the boundary between reality and fiction.",
  },
  nextCta: {
    eyebrow: "Next",
    heading: "See how the work is made.",
    linkLabel: "Enter the studio",
  },
};
