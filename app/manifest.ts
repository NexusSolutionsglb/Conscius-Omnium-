import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conscious Omnium — Shivjeet Potdar",
    short_name: "Conscious Omnium",
    description:
      "The practice of Shivjeet Potdar — architect, interior and production designer, and filmmaker.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#14110e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
