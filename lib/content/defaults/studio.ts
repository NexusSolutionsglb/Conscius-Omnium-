import type { StudioContent } from "@/lib/types";
import { pagesSeed } from "@/lib/content/pages";

const seed = pagesSeed.find((p) => p.slug === "studio");

/** Default editable copy for `/studio` — verbatim from `app/(site)/studio/page.tsx`
 *  and the bundled `pagesSeed`. */
export const studioDefaults: StudioContent = {
  hero: {
    eyebrow: "Studio & Process",
    heading: "Material,\nthen idea.",
  },
  intro:
    seed?.intro ??
    "The practice is built at the scale of a table as often as at the scale of a site. Material first, then idea, then the long work of making one convince you of the other.",
  body: (seed?.sections ?? []).map((s) => ({
    id: s.id,
    eyebrow: s.eyebrow ?? "",
    heading: s.heading ?? "",
    body: s.body ?? [],
    image: s.image ?? null,
    caption: s.caption ?? null,
    layout: s.layout === "image-left" ? "image-left" : "image-right",
  })),
  endCta: {
    eyebrow: "See it applied",
    heading: "Every method, in the work itself.",
    linkLabel: "View selected work",
  },
};
