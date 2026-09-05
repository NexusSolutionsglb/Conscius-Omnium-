import type { ContactContent } from "@/lib/types";

/** Default editable copy for `/contact` — verbatim from `app/(site)/contact/page.tsx`.
 * The heading and supporting line come from `settings.contactCopy` (shared with
 * the home Contact CTA), so they are edited there. */
export const contactDefaults: ContactContent = {
  eyebrow: "Contact",
  formEyebrow: "Send an enquiry",
  whatsappLabel: "Chat on WhatsApp",
  enquiryEmailLabel: "Enquiries",
  infoEmailLabel: "General",
  studioEmailLabel: "Studio & projects",
  phoneLabel: "Phone",
  whatsappRowLabel: "WhatsApp",
  locationLabel: "Based in",
  messageStudio: "Message the studio",
};
