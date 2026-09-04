"use client";

import type { Work } from "@/lib/types";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { whatsappLink, whatsappWorkMessage } from "@/lib/whatsapp";
import { InquiryDialog } from "./inquiry-dialog";

/**
 * The enquiry call-to-action for a work. Opens the premium enquiry
 * dialog (pre-filled with this work) and offers a WhatsApp SHARE link
 * whose message is built dynamically from the record.
 */
export function WorkInquiryBar({
  work,
  whatsappNumber,
}: {
  work: Work;
  whatsappNumber: string;
}) {
  const notForSale = work.availability === "not-for-sale";
  const waHref = whatsappLink(
    whatsappWorkMessage({
      title: work.title,
      year: work.year,
      medium: work.medium,
      slug: work.slug,
    }),
    whatsappNumber,
  );

  return (
    <div className="border-t border-line pt-8">
      <p className="u-eyebrow">{notForSale ? "This work" : "Interested in this work?"}</p>
      <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-ink-soft">
        {notForSale
          ? "This piece isn't for sale, but the studio is glad to talk about the thinking behind it, a commission in the same spirit, or an exhibition."
          : "Enquire about availability, dimensions, framing and price. Every enquiry is read personally by Shivjeet."}
      </p>
      <p className="mt-4 text-[0.78rem] text-ink-mute">
        Status — {AVAILABILITY_LABELS[work.availability]}
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <InquiryDialog
          work={{ slug: work.slug, title: work.title, year: work.year, medium: work.medium }}
          triggerLabel={notForSale ? "Enquire about this work" : "Enquire about this work"}
          defaultType={notForSale ? "general" : "purchase"}
        />
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="u-btn u-btn--ghost">
          Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
}
