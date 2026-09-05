import type { Profile } from "@/lib/types";

/**
 * The studio's three published addresses. Each has a purpose, and the site
 * shows the right one for the context rather than a single catch-all:
 *
 *   enquiry — enquiries, commissions and bookings (the contact form's inbox)
 *   info    — general information (footer, about, legal, structured data)
 *   studio  — studio, services and project correspondence
 *
 * These are the built-in defaults. The live values come from `profile`, so
 * they stay editable from the admin panel and the visual editor.
 */
export const CONTACT_EMAILS = {
  enquiry: "enquiry@consciusomnium.com",
  info: "info@consciusomnium.com",
  studio: "studio@consciusomnium.com",
} as const;

export type ContactEmailPurpose = keyof typeof CONTACT_EMAILS;

const clean = (v: string | null | undefined) => (typeof v === "string" ? v.trim() : "");

/**
 * Resolve the three addresses for a profile, falling back to the defaults
 * above so a page never renders an empty `mailto:` — including on a database
 * that predates the `enquiry_email` / `info_email` / `studio_email` columns.
 */
export function contactEmails(profile: Pick<
  Profile,
  "enquiryEmail" | "infoEmail" | "studioEmail"
>): Record<ContactEmailPurpose, string> {
  return {
    enquiry: clean(profile.enquiryEmail) || CONTACT_EMAILS.enquiry,
    info: clean(profile.infoEmail) || CONTACT_EMAILS.info,
    studio: clean(profile.studioEmail) || CONTACT_EMAILS.studio,
  };
}
