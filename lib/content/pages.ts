import type { ManagedPage } from "@/lib/types";

/**
 * Editable body content for the near-static pages. Every string here is
 * surfaced in Admin → Pages; the structural layout lives in the routes.
 */
export const pagesSeed: ManagedPage[] = [
  {
    slug: "about",
    title: "About",
    intro:
      "Within the smallest point, the whole is hidden. Within the self, the universe waits to be known.",
    sections: [
      {
        id: "about-conscius-omnium",
        eyebrow: "Conscius Omnium™",
        heading: "Awareness of the whole",
        layout: "text",
        body: [
          "Art is a way of entering that space. Painting, dance, music, architecture — each becomes a language for looking inward, going deeper, and awakening to what connects everything.",
          "Art is rebellion. It questions the reality we inherit, breaks through Maya, and opens a passage into what lies beyond the familiar.",
          "When creation becomes meditation, art becomes a path to higher knowing. Every work is an exploration of consciousness and a step towards the Ultimate Artwork — a creation that does not represent awareness, but embodies it; a work that needs no explanation, where the observer does not merely see, but experiences. Such a work becomes a portal: awareness expressed through form.",
          "Every creation is a trace of this possibility. Just as a building exists first as an idea before taking form, the unseen precedes the seen. Each artwork becomes a footprint of what is yet to emerge.",
          "Different forms. Different questions. One pursuit: from perception to knowing, from the individual to the whole, from form to awareness.",
          "This is the work of Conscius Omnium™.",
        ],
      },
    ],
    seo: {
      title: "About — Shivjeet Potdar",
      description:
        "Shivjeet Potdar — artist, architect, production designer and filmmaker. B.Arch, RV College of Architecture, Bengaluru; Production Design, FTII Pune.",
    },
  },
  {
    slug: "studio",
    title: "Studio & Process",
    intro:
      "A self-taught practice: the paintings emerge through observation, meditation, and experimentation — abstract forms, layered surfaces, and process-driven methods.",
    sections: [
      {
        id: "studio-meditation",
        eyebrow: "01 — Meditation",
        heading: "It begins with sitting still",
        layout: "image-right",
        image: "/gallery/black-canvas/breath-and-the-mind-context.jpg",
        caption: "Breath and the Mind — oil pastels on black paper, 54 × 67 cm.",
        body: [
          "Through Anapana meditation, attention moves towards the breath: the touch of air at the nostrils, the movement through the body, and subtle sensations around the forehead.",
          "Thoughts continue to arise and pull attention away, but awareness returns again and again to the breath. The black canvas is where that begins — a space before form, representing stillness and possibility.",
        ],
      },
      {
        id: "studio-attention",
        eyebrow: "02 — Attention",
        heading: "Whatever gathers around the light",
        layout: "image-left",
        image: "/gallery/states-of-attention/the-light-attracts-everything-context.jpg",
        caption: "The Light Attracts Everything — acrylic on ivory paper, 56 × 71 cm.",
        body: [
          "A 3 AM meditation led into this painting process. As the terrace lights drew bees from the darkness, the act of creating also brought distraction, fear, movement, and awareness to the surface.",
          "With deeper focus the external world begins to fade, and patterns start appearing through afterimages — symmetrical forms emerging within the swarm. Attention can transform disturbance into perception.",
        ],
      },
      {
        id: "studio-material",
        eyebrow: "03 — Material",
        heading: "Gum, powder, burn",
        layout: "image-right",
        image: "/gallery/black-canvas/shape-of-belief-context.jpg",
        caption: "Shape of Belief — acrylic and chalk powder on black paper, 54 × 67 cm.",
        body: [
          "Shape of Belief starts with transparent gum applied on the black surface — an invisible structure waiting to be revealed. Powder colour is then introduced, exposing patterns that were already formed before they became visible.",
          "For Pyre for Perspective the paper itself was burned, the burn marks forming an eye-like structure on the canvas — less about creating an image and more about confronting perspective through destruction.",
        ],
      },
      {
        id: "studio-documented",
        eyebrow: "04 — Documented",
        heading: "The process, filmed",
        layout: "image-left",
        image: "/gallery/states-of-awareness/the-observer-context.jpg",
        caption: "The Observer — acrylic on paper, 22 × 22 in.",
        body: [
          "Most works are made in front of a camera. Each painting in the gallery carries a link to the session it came out of — the meditation, the distraction, the decisions made in real time.",
          "Whether on canvas, an everyday object, or within a film set, the intention remains the same: to turn attention inward through art.",
        ],
      },
    ],
    seo: {
      title: "Studio & Process — Conscius Omnium™",
      description:
        "Inside the practice of Shivjeet Potdar: meditation, observation and experimentation — oil pastel on black paper, acrylic on ivory paper, gum and powder, burnt paper.",
    },
  },
  {
    slug: "contact",
    title: "Contact",
    intro:
      "For collectors, collaborators, curators, institutions, production houses and commissions. Every enquiry is read personally.",
    sections: [],
    seo: {
      title: "Contact — Conscius Omnium™",
      description:
        "Get in touch with Shivjeet Potdar — commissions, collaborations, exhibitions, production design and acquisitions.",
    },
  },
];
