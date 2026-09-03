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
      "Shivjeet Potdar is an architect, interior and production designer, and filmmaker. The practice moves between built space, the photographed miniature, the render and the screen.",
    sections: [
      {
        id: "about-throughline",
        eyebrow: "The throughline",
        heading: "Art and science, holding hands",
        layout: "text",
        body: [
          "It started as a child drawing mythology and wanting to live in it. Then wanting to be an artist. Then deciding — after reading that all art is quite useless — that science was more useful, and building an electric dynamo to prove it.",
          "Architecture became the place both could stand. Science is the body; art is its soul. The work since has circled one question: what to do with the ruin, the eco-void, the monument, the dead quarry — how to build so a place is reclaimed rather than erased.",
          "Lately it has moved toward the boundary between reality and fiction: production design, character design, and the beginnings of filmmaking.",
        ],
      },
      {
        id: "about-approach",
        eyebrow: "Approach",
        heading: "Whatever the idea needs",
        layout: "text",
        body: [
          "A single project might be a plaster miniature photographed until the seam disappears, a 3D render set back into a real landscape, a built canopy of bent steel, or a title card for a Kannada feature. The medium is chosen by the idea, not the other way around.",
          "The recurring materials are plaster of Paris, box board and craft board; a camera; rendering software; ink; oil paint. The recurring sites are the Deccan forts, the forest edge, the quarry, the riverbank opposite a famous tomb.",
        ],
      },
    ],
    seo: {
      title: "About — Shivjeet Potdar",
      description:
        "Shivjeet Potdar — architect, interior and production designer, and filmmaker. B.Arch, RV College of Architecture, Bengaluru; Production Design, FTII Pune.",
    },
  },
  {
    slug: "studio",
    title: "Studio & Process",
    intro:
      "The practice is built at the scale of a table as often as at the scale of a site. Material first, then idea, then the long work of making one convince you of the other.",
    sections: [
      {
        id: "studio-material",
        eyebrow: "01 — Material",
        heading: "Plaster, board, mirror, fern",
        layout: "image-right",
        image: "/work/the-shapeshifting-landscape.jpg",
        caption: "The Shape-Shifting Landscape — plaster dunes, set mirrors for water, fern for vegetation.",
        body: [
          "Terrain is carved in plaster of Paris and painted. Buildings and cities are cut from box board, craft board and mount board. Water is a piece of mirror; a forest is a handful of fern; a caravan is three plastic camels.",
          "Working small is not a compromise on the real thing — it is a way of testing an idea cheaply, at speed, with your hands.",
        ],
      },
      {
        id: "studio-photograph",
        eyebrow: "02 — Image",
        heading: "Photograph, then manipulate",
        layout: "image-left",
        image: "/work/the-lost-city.jpg",
        caption: "The Lost City — a plaster model shot low, then extended into an endless blue desert.",
        body: [
          "The model is lit and photographed at eye level, so the horizon reads as a horizon. Then the image is manipulated — sky extended, dusk introduced, a figure dropped in at the right scale — until the object becomes a world.",
          "The goal is the moment the viewer forgets they are looking at something that fits on a desk.",
        ],
      },
      {
        id: "studio-render",
        eyebrow: "03 — Render",
        heading: "Set the drawing back into the world",
        layout: "image-right",
        image: "/work/resurrection-from-the-ruins.jpg",
        caption: "Resurrection from the Ruins — a 3D proposal composited into a photograph of the fort landscape.",
        body: [
          "For the speculative buildings — the tower over the ruin, the Black Taj, the lattice house on the forest edge — the structure is modelled in 3D and composited into a real photograph of the site, birds and all.",
          "It keeps the proposal honest: it has to survive being placed next to the thing it wants to change.",
        ],
      },
      {
        id: "studio-build",
        eyebrow: "04 — Build",
        heading: "And sometimes, build it",
        layout: "image-left",
        image: "/work/pavilion-rvca-x.jpg",
        caption: "Pavilion RVCA X — 8 torr steel bent to shape and anchored, framing stretched jute.",
        body: [
          "Pavilion RVCA X was built at full scale for the 2017 college exhibition — bent steel anchored into the ground, jute stretched within it, a soft structure people walked under for a week.",
          "The residential and institutional projects — Suman's Residence, the Bidar ashrama — carry the same instinct into drawings meant to be constructed.",
        ],
      },
    ],
    seo: {
      title: "Studio & Process — Conscious Omnium",
      description:
        "Inside the practice of Shivjeet Potdar: plaster miniatures, photographic manipulation, 3D renders composited into real sites, and built work.",
    },
  },
  {
    slug: "contact",
    title: "Contact",
    intro:
      "For collectors, collaborators, curators, institutions, production houses and commissions. Every enquiry is read personally.",
    sections: [],
    seo: {
      title: "Contact — Conscious Omnium",
      description:
        "Get in touch with Shivjeet Potdar — commissions, collaborations, exhibitions, production design and acquisitions.",
    },
  },
];
