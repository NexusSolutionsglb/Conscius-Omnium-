import { CONTACT_EMAILS, contactEmails, type ContactEmailPurpose } from "@/lib/contact-emails";
import { INQUIRY_TYPE_LABELS, type InquiryType, type Profile } from "@/lib/types";
import { env } from "@/lib/env";

/**
 * Where each kind of submission is delivered.
 *
 *   enquiry@ — enquiries, consultations, bookings and service enquiries
 *   info@    — general contact and information requests
 *   studio@  — studio, creative and project-related enquiries
 *
 * The addresses themselves are admin-editable (Admin → Artist profile); this
 * map decides which of the three a given enquiry type belongs to. Admin →
 * Email routing renders it, so the studio can see exactly where each form
 * lands without reading the code.
 */
export const INQUIRY_ROUTING: Record<InquiryType, ContactEmailPurpose> = {
  // Buying, availability, commissions and bookings.
  purchase: "enquiry",
  availability: "enquiry",
  commission: "enquiry",
  // Studio, creative and project work.
  collaboration: "studio",
  exhibition: "studio",
  // Everything general.
  press: "info",
  general: "info",
};

export const PURPOSE_LABELS: Record<ContactEmailPurpose, string> = {
  enquiry: "Enquiries, consultations & bookings",
  info: "General contact & information",
  studio: "Studio, creative & projects",
};

/** Newsletter mail is general correspondence — it goes out as info@. */
export const NEWSLETTER_PURPOSE: ContactEmailPurpose = "info";

/**
 * Resolve the inbox for an enquiry type.
 *
 * `INQUIRY_NOTIFY_EMAIL` still wins when it is set, so an existing deployment
 * that pipes everything to one inbox keeps working; leave it unset to use the
 * three routed addresses.
 */
export function inboxForInquiryType(
  type: InquiryType,
  profile?: Pick<Profile, "enquiryEmail" | "infoEmail" | "studioEmail"> | null,
): { to: string; purpose: ContactEmailPurpose; overridden: boolean } {
  const purpose = INQUIRY_ROUTING[type] ?? "enquiry";
  const override = process.env.INQUIRY_NOTIFY_EMAIL?.trim();
  if (override) return { to: override, purpose, overridden: true };
  const resolved = profile ? contactEmails(profile) : CONTACT_EMAILS;
  return { to: resolved[purpose], purpose, overridden: false };
}

export function inboxForPurpose(
  purpose: ContactEmailPurpose,
  profile?: Pick<Profile, "enquiryEmail" | "infoEmail" | "studioEmail"> | null,
): string {
  return (profile ? contactEmails(profile) : CONTACT_EMAILS)[purpose];
}

/**
 * The `From:` header. Resend requires a verified domain, so this stays an
 * environment variable — but the reply-to is the routed studio address, so a
 * visitor replying to a confirmation reaches the right inbox either way.
 */
export function fromHeader(): string {
  return env.resendFrom;
}

/** A human label for an enquiry type, safe for unknown values. */
export function inquiryTypeLabel(type: InquiryType): string {
  return INQUIRY_TYPE_LABELS[type] ?? "Enquiry";
}
