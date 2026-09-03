import type { Collection } from "@/lib/types";

/**
 * Series drawn from the portfolio itself. Every work is assigned to at
 * most one. Copy describes only what the works have in common — no
 * invented history.
 */
export const collectionsSeed: Collection[] = [
  {
    id: "col-ruin",
    slug: "ruin-and-remembrance",
    title: "Ruin & Remembrance",
    description:
      "Work that sits with decay — the Deccan forts, the bombed walls, the monuments half-returned to ground — and asks what it means to hold, conserve or resurrect a place without embalming it.",
    period: "Ongoing",
    coverImage: "/work/the-formalin-man.jpg",
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    id: "col-miniature",
    slug: "miniature-worlds",
    title: "Miniature Worlds",
    description:
      "Landscapes and cities built at the scale of a table — plaster, box board, mirror, fern — then photographed until the seam between model and world disappears.",
    period: "Ongoing",
    coverImage: "/work/the-lost-city.jpg",
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    id: "col-spatial",
    slug: "building-and-spatial-practice",
    title: "Building & Spatial Practice",
    description:
      "Realised and speculative architecture — a pavilion of bent steel, a house that breathes in a dry climate, a tower that grows out of a quarry it is trying to heal.",
    period: "2017 — ongoing",
    coverImage: "/work/natures-rage-render.jpg",
    featured: true,
    published: true,
    sortOrder: 3,
  },
  {
    id: "col-screen",
    slug: "screen-myth-and-mark",
    title: "Screen, Myth & Mark",
    description:
      "Production design, title cards, posters and identities — where a Kannada feature, a Prime Original and a coffee house are all folded back into Indian myth.",
    period: "Ongoing",
    coverImage: "/work/lore-tools.jpg",
    featured: false,
    published: true,
    sortOrder: 4,
  },
  {
    id: "col-paint",
    slug: "paint-and-line",
    title: "Paint & Line",
    description:
      "The quiet register of the practice — an abstract Shiva emerging from a blue cosmos, an entire seascape reduced to four lines.",
    period: "Ongoing",
    coverImage: "/work/shiva.jpg",
    featured: false,
    published: true,
    sortOrder: 5,
  },
];
