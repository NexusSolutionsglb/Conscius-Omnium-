import type { Collection } from "@/lib/types";

/**
 * The four real painting series, supplied by the client directly
 * (photographs + the artist's own descriptions). Each description below
 * only restates what the artist wrote for the individual works in the
 * series — nothing about the series as a whole is invented.
 */
export const collectionsSeed: Collection[] = [
  {
    id: "col-black-canvas",
    slug: "black-canvas",
    title: "Black Canvas",
    description:
      "Five works in oil pastel — and, for the last, acrylic and chalk powder — on black paper. Each begins the same way: a seated meditation on the breath, attention returning again and again to whatever the mind offers up along the way.",
    period: "2026",
    coverImage: "/gallery/black-canvas/shape-of-belief.jpg",
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    id: "col-states-of-attention",
    slug: "states-of-attention",
    title: "States of Attention",
    description:
      "Five works made across consecutive early-morning sessions, each beginning in meditation and each returning to the same accidental subject — bees drawn to a terrace light at 3 a.m. — as observation moved from distraction toward stillness.",
    period: "2026",
    coverImage: "/gallery/states-of-attention/the-light-attracts-everything.jpg",
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    id: "col-duality",
    slug: "duality",
    title: "Duality",
    description:
      "Paired opposites, worked in acrylic on ivory paper. On the first of these, The Burden of Goodness, the artist writes: “The painting ultimately asks: who are you beyond the need to be good, bad, right, or wrong?”",
    period: "Ongoing",
    coverImage: "/gallery/duality/the-burden-of-goodness.jpg",
    featured: true,
    published: true,
    sortOrder: 3,
  },
  {
    id: "col-states-of-awareness",
    slug: "states-of-awareness",
    title: "States of Awareness",
    description:
      "The Nilgai series — five paintings following one continuous journey: a bird's passage from the nest, through the weight of a newly formed self, to a stillness observed in a forest clearing, and finally into perspective and bliss.",
    period: "2026",
    coverImage: "/gallery/states-of-awareness/the-observer.jpg",
    featured: true,
    published: true,
    sortOrder: 4,
  },
];
