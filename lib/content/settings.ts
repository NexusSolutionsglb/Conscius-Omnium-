import type { SiteSettings } from "@/lib/types";

export const settingsSeed: SiteSettings = {
  brand: "Conscius Omnium™",
  brandLine: "Shivjeet Potdar",
  tagline: "Architect · Production Designer · Filmmaker",
  logo: "/logo/mark-black.png",
  logoInverted: "/logo/mark-white.png",
  nav: [
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Studio", href: "/studio" },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "Conscius Omnium™ — Shivjeet Potdar",
    heading: "Awareness through art",
    supporting: "by SHIVJEET POTDAR",
    ctaLabel: "Seek",
    ctaHref: "/contact#enquiry-form",
    workSlug: null,
    image: null,
    video: null,
    showMeta: false,
  },
  footerNote:
    "Conscius Omnium™ is the studio of Shivjeet Potdar — architecture, interiors, production design and film.",
  contactCopy: {
    heading: "Let's talk about the work.",
    supporting:
      "For collectors, collaborators, curators, institutions, production houses and commissions.",
  },
  seo: {
    defaultTitle: "Conscius Omnium™ — Shivjeet Potdar",
    titleTemplate: "%s — Conscius Omnium™",
    description:
      "Conscius Omnium™ is the practice of Shivjeet Potdar — architect, interior and production designer, and filmmaker. Built space, miniatures, renders and screen work circling ruin, memory and the boundary between reality and fiction.",
    ogImage: "/gallery/states-of-attention/the-light-attracts-everything.jpg",
  },
};
