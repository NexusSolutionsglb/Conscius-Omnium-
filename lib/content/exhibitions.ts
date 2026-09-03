import type { Exhibition } from "@/lib/types";

/**
 * Only what the monograph documents. The one recorded public showing is
 * the 2017 RVCA exhibition, where Pavilion RVCA X was built and installed.
 * The Admin adds new entries as the archive grows — nothing is invented here.
 */
export const exhibitionsSeed: Exhibition[] = [
  {
    id: "ex-rvca-2017",
    title: "Pavilion RVCA X",
    year: "2017",
    venue: "RV College of Architecture",
    city: "Bengaluru",
    country: "India",
    type: "installation",
    dateLabel: "Annual Exhibition, 2017",
    description:
      "A curvilinear pavilion of bent steel and stretched jute fabric, built across the central congregational area of the college for the annual exhibition.",
    url: null,
    published: true,
    sortOrder: 1,
    relatedSlugs: ["pavilion-rvca-x"],
  },
];
