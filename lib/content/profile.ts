import type { Profile } from "@/lib/types";
import { CONTACT_EMAILS } from "@/lib/contact-emails";

/**
 * Verbatim from `WEBSITE DESIGN MATERIAL/pages/about/about text.pptx`
 * (artist-bio text box) and the cover page of `SP 10 260626.pdf`
 * (contact details). Nothing here is invented — see that source for
 * the exact wording.
 */
export const profileSeed: Profile = {
  name: "Shivjeet Potdar",
  roles: ["Artist", "Architect", "Production Designer", "Filmmaker"],
  headline: "To turn attention inward through art.",
  statement:
    "Art is not simply an object to be seen. It is a space in which awareness can happen.",
  bio: [
    "Shivjeet Potdar is an architect, filmmaker, and self-taught artist whose practice explores consciousness, perception, duality, and the relationship between the inner and outer worlds.",
    "Trained in architecture at RV College of Architecture, Bengaluru, and in Production Design at the Film and Television Institute of India (FTII), Pune, Shivjeet approaches art through space, form, symbolism, and narrative.",
    "His paintings often emerge from questions rather than answers — about identity, awareness, existence, and the nature of reality. Drawing from meditation, philosophy, geometry, and everyday human experience, he creates works that invite the viewer not merely to look, but to observe.",
    "His practice moves between painting, sculpture, spatial design, and visual storytelling. Whether on canvas, an everyday object, or within a film set, the intention remains the same: to turn attention inward through art.",
  ],
  education: [
    {
      qualification: "Bachelor of Architecture",
      institution: "RV College of Architecture, Bengaluru",
    },
    {
      qualification: "Production Design",
      institution: "Film and Television Institute of India, Pune",
    },
  ],
  email: "shivjeetpotdar@gmail.com",
  enquiryEmail: CONTACT_EMAILS.enquiry,
  infoEmail: CONTACT_EMAILS.info,
  studioEmail: CONTACT_EMAILS.studio,
  phone: "+91 99729 10950",
  whatsapp: "919972910950",
  location: "Bengaluru, India",
  portrait: "/profile/shivjeet-potdar.jpg",
  social: [
    { label: "Instagram", href: "https://instagram.com/conscius_omnium" },
    { label: "YouTube", href: "https://youtube.com/@shivjeetpotdar" },
  ],
};
