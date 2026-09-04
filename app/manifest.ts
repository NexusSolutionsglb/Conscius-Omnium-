import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conscious Omnium — Shivjeet Potdar",
    short_name: "Conscious Omnium",
    description:
      "The practice of Shivjeet Potdar — architect, interior and production designer, and filmmaker.",
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["art", "design", "portfolio"],
    background_color: "#f7f4ef",
    theme_color: "#14110e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
