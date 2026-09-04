/** Editable footer legal / attribution text. Empty string ⇒ the block is hidden.
 *  Every value here is a fallback: whatever is saved in Admin → Settings wins. */
export const FOOTER_LEGAL_DEFAULT =
  "All images, drawings, models, renders, films and written material on this site are the original work of Shivjeet Potdar and are protected by copyright. They may not be reproduced, reused, adapted or redistributed in any form without prior written permission from the studio.";

export const FOOTER_OWNER_DEFAULT = "Conscious Omnium — the studio of Shivjeet Potdar";

/** `{year}` and `{brand}` are substituted when rendered. */
export const FOOTER_COPYRIGHT_DEFAULT = "© {year} {brand}. All rights reserved.";

/** `{name}` and `{roles}` (first three, “ · ” joined) are substituted. */
export const FOOTER_CREDIT_DEFAULT = "{name} — {roles}";

/** Utility links rendered beside the copyright line. */
export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
] as const;
