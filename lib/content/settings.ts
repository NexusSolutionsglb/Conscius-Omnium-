import type { SiteSettings } from "@/lib/types";

export const settingsSeed: SiteSettings = {
  brand: "Conscious Omnium",
  brandLine: "Shivjeet Potdar",
  tagline: "Architect · Production Designer · Filmmaker",
  nav: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Studio", href: "/studio" },
    { label: "Exhibitions", href: "/exhibitions" },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "Conscious Omnium — Shivjeet Potdar",
    heading: "Architecture, image, and the things between them.",
    supporting:
      "A cross-disciplinary practice working between built space, the miniature, the render and the screen — circling what it means to hold a place rather than erase it.",
    ctaLabel: "Enter the work",
    ctaHref: "/work",
    workSlug: "ghosts-of-takht-mahal",
    image: null,
    showMeta: true,
  },
  footerNote:
    "Conscious Omnium is the studio of Shivjeet Potdar — architecture, interiors, production design and film.",
  contactCopy: {
    heading: "Let's talk about the work.",
    supporting:
      "For collectors, collaborators, curators, institutions, production houses and commissions.",
  },
  seo: {
    defaultTitle: "Conscious Omnium — Shivjeet Potdar",
    titleTemplate: "%s — Conscious Omnium",
    description:
      "Conscious Omnium is the practice of Shivjeet Potdar — architect, interior and production designer, and filmmaker. Built space, miniatures, renders and screen work circling ruin, memory and the boundary between reality and fiction.",
    ogImage: "/work/the-black-taj-mahal.jpg",
  },
};
