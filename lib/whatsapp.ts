import { env } from "@/lib/env";
import type { Work } from "@/lib/types";

/**
 * WhatsApp integration here means SHARE LINKS, not the Business API.
 * Everything below builds a `https://wa.me/<number>?text=<message>` URL
 * (or `https://api.whatsapp.com/send`) that opens the chat with a
 * pre-filled message. Nothing is sent automatically.
 */

const WA_BASE = "https://wa.me";

export function whatsappLink(message: string, toNumber?: string): string {
  const number = (toNumber ?? env.whatsappNumber).replace(/[^\d]/g, "");
  const text = encodeURIComponent(message.trim());
  return number ? `${WA_BASE}/${number}?text=${text}` : `${WA_BASE}/?text=${text}`;
}

/** Generic "chat on WhatsApp" from the contact page / global button. */
export function whatsappGeneralMessage(brand = "Conscious Omnium"): string {
  return [
    `Hello Shivjeet,`,
    ``,
    `I found ${brand} and would like to get in touch about the work.`,
  ].join("\n");
}

/**
 * Pre-filled enquiry for a specific work. Built dynamically from the
 * record — never hard-coded per artwork.
 */
export function whatsappWorkMessage(
  work: Pick<Work, "title" | "year" | "medium" | "slug">,
  visitor?: { name?: string; email?: string; phone?: string; note?: string },
  siteUrl = env.siteUrl,
): string {
  const lines = [
    `Hello Shivjeet,`,
    ``,
    `I'm interested in the work:`,
    ``,
    `“${work.title.toUpperCase()}”`,
  ];
  if (work.year) lines.push(`Year: ${work.year}`);
  if (work.medium) lines.push(`Medium: ${work.medium}`);
  lines.push(`Link: ${siteUrl}/work/${work.slug}`);
  lines.push(``);
  if (visitor?.name) lines.push(`Name: ${visitor.name}`);
  if (visitor?.email) lines.push(`Email: ${visitor.email}`);
  if (visitor?.phone) lines.push(`Phone: ${visitor.phone}`);
  if (visitor?.name || visitor?.email || visitor?.phone) lines.push(``);
  lines.push(
    visitor?.note?.trim() ||
      `I would like to know more about this work — availability, dimensions and price.`,
  );
  lines.push(``, `Thank you.`);
  return lines.join("\n");
}

export function whatsappInquiryMessage(inquiry: {
  ref: string;
  name: string;
  email: string;
  phone?: string | null;
  typeLabel: string;
  message: string;
  workTitle?: string | null;
}): string {
  const lines = [
    `Hello Shivjeet,`,
    ``,
    `Following up on my enquiry (${inquiry.ref}).`,
    ``,
  ];
  if (inquiry.workTitle) lines.push(`Work: “${inquiry.workTitle}”`);
  lines.push(`Type: ${inquiry.typeLabel}`);
  lines.push(`Name: ${inquiry.name}`);
  lines.push(`Email: ${inquiry.email}`);
  if (inquiry.phone) lines.push(`Phone: ${inquiry.phone}`);
  lines.push(``, inquiry.message, ``, `Thank you.`);
  return lines.join("\n");
}
