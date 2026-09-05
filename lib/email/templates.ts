import {
  INQUIRY_SOURCE_LABELS,
  INQUIRY_TYPE_LABELS,
  type Inquiry,
  type NewsletterCampaign,
} from "@/lib/types";
import { absoluteUrl, formatDate } from "@/lib/utils";
import {
  PALETTE,
  FONT_DISPLAY,
  FONT_SANS,
  button,
  detailLinkRow,
  detailRow,
  detailTable,
  escapeHtml,
  eyebrow,
  ghostButton,
  heading,
  lead,
  paragraphs,
  quote,
  rule,
  shell,
  spacer,
  steps,
  textFooter,
} from "./branding";

export interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}

const PREFERRED_CONTACT_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
};

/** "12 Mar 2026 at 14:08 IST" — unambiguous for the studio's own timezone. */
function stamp(value: string): string {
  const date = formatDate(value, { day: "numeric", month: "short", year: "numeric" });
  let time = "";
  try {
    time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(new Date(value));
  } catch {
    time = "";
  }
  return time ? `${date} at ${time} IST` : date;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name.trim();

/* ═══════════════════ 1 · internal notification ═══════════════════ */

/**
 * "New Enquiry Received" — everything the studio needs to answer without
 * opening the admin panel, in the order they'd want to read it.
 */
export function adminInquiryEmail(
  inquiry: Inquiry,
  ctx: { inbox: string } = { inbox: "" },
): EmailMessage {
  const typeLabel = INQUIRY_TYPE_LABELS[inquiry.type] ?? "Enquiry";
  const sourceLabel = inquiry.source
    ? (INQUIRY_SOURCE_LABELS[inquiry.source] ?? inquiry.source)
    : null;

  const subject = inquiry.workTitle
    ? `New enquiry · ${inquiry.workTitle} · ${inquiry.ref}`
    : `New enquiry · ${typeLabel} · ${inquiry.ref}`;

  const replyHref = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Re: your enquiry to Conscius Omnium (${inquiry.ref})`,
  )}`;

  const body = `
${eyebrow(`Reference ${inquiry.ref}`, PALETTE.accent)}
${heading("New enquiry received")}
${lead(
  `<strong style="color:${PALETTE.ink};">${escapeHtml(inquiry.name)}</strong> got in touch through the ${escapeHtml(
    (sourceLabel ?? "website").toLowerCase(),
  )} about <strong style="color:${PALETTE.ink};">${escapeHtml(typeLabel.toLowerCase())}</strong>.`,
)}
${spacer(10)}
${detailTable(`
${detailRow("Name", escapeHtml(inquiry.name))}
${detailLinkRow("Email", inquiry.email, `mailto:${inquiry.email}`)}
${detailLinkRow("Phone", inquiry.phone, `tel:${(inquiry.phone ?? "").replace(/[^\d+]/g, "")}`)}
${detailRow("Enquiry type", escapeHtml(typeLabel))}
${detailRow("Artwork", inquiry.workTitle ? escapeHtml(inquiry.workTitle) : "")}
${detailRow("Country", inquiry.country ? escapeHtml(inquiry.country) : "")}
${detailRow("Budget", inquiry.budget ? escapeHtml(inquiry.budget) : "")}
${detailRow(
  "Prefers",
  inquiry.preferredContact
    ? escapeHtml(PREFERRED_CONTACT_LABELS[inquiry.preferredContact] ?? inquiry.preferredContact)
    : "",
)}
${detailRow("Received", escapeHtml(stamp(inquiry.createdAt)))}
${detailRow("Form / source", sourceLabel ? escapeHtml(sourceLabel) : "")}
${detailRow("Routed to", ctx.inbox ? escapeHtml(ctx.inbox) : "")}
`)}
${spacer(26)}
${eyebrow("Message")}
${quote(inquiry.message)}
${spacer(28)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding:0 12px 0 0;">${button("Reply to " + escapeHtml(firstName(inquiry.name)), replyHref)}</td>
<td>${ghostButton("Open in admin", absoluteUrl(`/admin/inquiries/${inquiry.id}`))}</td>
</tr></table>
`;

  const text = [
    "NEW ENQUIRY RECEIVED",
    `Reference: ${inquiry.ref}`,
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    `Enquiry type: ${typeLabel}`,
    inquiry.workTitle ? `Artwork: ${inquiry.workTitle}` : null,
    inquiry.country ? `Country: ${inquiry.country}` : null,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
    inquiry.preferredContact
      ? `Prefers: ${PREFERRED_CONTACT_LABELS[inquiry.preferredContact] ?? inquiry.preferredContact}`
      : null,
    `Received: ${stamp(inquiry.createdAt)}`,
    sourceLabel ? `Form / source: ${sourceLabel}` : null,
    ctx.inbox ? `Routed to: ${ctx.inbox}` : null,
    "",
    "MESSAGE",
    inquiry.message,
    "",
    `Reply: ${inquiry.email}`,
    `Admin: ${absoluteUrl(`/admin/inquiries/${inquiry.id}`)}`,
    textFooter(),
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return {
    subject,
    html: shell(subject, body, {
      kicker: "New enquiry",
      preheader: `${inquiry.name} — ${typeLabel}${inquiry.workTitle ? ` — ${inquiry.workTitle}` : ""}`,
      replyTo: ctx.inbox || undefined,
      footerLinks: [{ label: "Admin inbox", href: absoluteUrl("/admin/inquiries") }],
    }),
    text,
  };
}

/* ═══════════════════ 2 · visitor confirmation ════════════════════ */

/**
 * The visitor's copy. Written to read like a note from the studio rather
 * than a receipt: what they asked, what happens next, how to reach a person.
 */
export function visitorConfirmationEmail(
  inquiry: Inquiry,
  ctx: { inbox: string } = { inbox: "" },
): EmailMessage {
  const typeLabel = INQUIRY_TYPE_LABELS[inquiry.type] ?? "Enquiry";
  const subject = inquiry.workTitle
    ? `We have your enquiry — “${inquiry.workTitle}”`
    : "We have your enquiry — Conscius Omnium™";

  const opening = inquiry.workTitle
    ? `Thank you for your enquiry about <strong style="color:${PALETTE.ink};">“${escapeHtml(inquiry.workTitle)}”</strong>. It has reached the studio and nothing further is needed from you.`
    : `Thank you for writing to Conscius Omnium™. Your message has reached the studio and nothing further is needed from you.`;

  const body = `
${eyebrow(`Reference ${inquiry.ref}`, PALETTE.accent)}
${heading(`Thank you, ${firstName(inquiry.name)}.`)}
${lead(opening)}
${lead(
  `Shivjeet reads every enquiry personally, so replies come from him rather than from a queue. Please keep your reference — <strong style="color:${PALETTE.ink};letter-spacing:0.08em;">${escapeHtml(inquiry.ref)}</strong> — for any follow-up.`,
)}
${rule(30)}
${eyebrow("What happens next")}
${steps([
  "Your enquiry is read at the studio, usually within one to two working days.",
  "Shivjeet replies directly to this email address with the details you asked for.",
  `If it is easier to talk, say so in your reply and the conversation moves to a call or WhatsApp.`,
])}
${rule(30)}
${eyebrow("Your enquiry")}
${detailTable(`
${detailRow("Reference", escapeHtml(inquiry.ref))}
${detailRow("Type", escapeHtml(typeLabel))}
${detailRow("Artwork", inquiry.workTitle ? escapeHtml(inquiry.workTitle) : "")}
${detailRow("Sent", escapeHtml(stamp(inquiry.createdAt)))}
`)}
${spacer(20)}
${quote(inquiry.message)}
${spacer(30)}
${button("View the gallery", absoluteUrl("/gallery"))}
`;

  const text = [
    `Thank you, ${firstName(inquiry.name)}.`,
    "",
    inquiry.workTitle
      ? `Thank you for your enquiry about "${inquiry.workTitle}". It has reached the studio.`
      : "Thank you for writing to Conscius Omnium™. Your message has reached the studio.",
    "",
    `Shivjeet reads every enquiry personally. Your reference is ${inquiry.ref}.`,
    "",
    "WHAT HAPPENS NEXT",
    "1. Your enquiry is read at the studio, usually within one to two working days.",
    "2. Shivjeet replies directly to this email address.",
    "3. If a call is easier, say so in your reply.",
    "",
    "YOUR ENQUIRY",
    `Reference: ${inquiry.ref}`,
    `Type: ${typeLabel}`,
    inquiry.workTitle ? `Artwork: ${inquiry.workTitle}` : null,
    `Sent: ${stamp(inquiry.createdAt)}`,
    "",
    inquiry.message,
    textFooter(ctx.inbox ? `Reply to this email or write to ${ctx.inbox}.` : null),
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return {
    subject,
    html: shell(subject, body, {
      kicker: "Enquiry received",
      preheader: `Your reference is ${inquiry.ref}. Shivjeet will reply personally.`,
      replyTo: ctx.inbox || undefined,
      footerLinks: [
        { label: "Gallery", href: absoluteUrl("/gallery") },
        { label: "Studio", href: absoluteUrl("/studio") },
        { label: "Privacy", href: absoluteUrl("/privacy") },
      ],
      footerNote:
        "You are receiving this because you sent an enquiry through consciusomnium.com. It is a one-off confirmation, not a mailing list.",
    }),
    text,
  };
}

/* ═══════════════════ 3 · newsletter welcome ══════════════════════ */

export function newsletterWelcomeEmail(subscriber: {
  email: string;
  name?: string | null;
  token: string;
  resubscribed?: boolean;
}): EmailMessage {
  const subject = subscriber.resubscribed
    ? "Welcome back to Conscius Omnium™"
    : "Welcome to Conscius Omnium™";
  const unsubscribeUrl = absoluteUrl(`/unsubscribe?token=${encodeURIComponent(subscriber.token)}`);
  const greeting = subscriber.name
    ? `Welcome, ${firstName(subscriber.name)}.`
    : "Welcome to the studio letter.";

  const body = `
${eyebrow(subscriber.resubscribed ? "Subscription restored" : "Subscription confirmed", PALETTE.accent)}
${heading(greeting)}
${lead(
  `You are subscribed to the Conscius Omnium™ letter at <strong style="color:${PALETTE.ink};">${escapeHtml(subscriber.email)}</strong>. It arrives occasionally — only when there is something worth sending.`,
)}
${rule(30)}
${eyebrow("What to expect")}
${steps([
  "New paintings as they leave the studio, with the thinking behind them.",
  "Exhibitions, screenings and open-studio dates, ahead of the public announcement.",
  "Occasional notes on process — meditation, material, the work of attention.",
])}
${rule(30)}
${lead("In the meantime, the current body of work is online.")}
${button("View the gallery", absoluteUrl("/gallery"))}
`;

  const text = [
    greeting,
    "",
    `You are subscribed to the Conscius Omnium™ letter at ${subscriber.email}.`,
    "It arrives occasionally — only when there is something worth sending.",
    "",
    "WHAT TO EXPECT",
    "· New paintings as they leave the studio, with the thinking behind them.",
    "· Exhibitions, screenings and open-studio dates, ahead of the public announcement.",
    "· Occasional notes on process.",
    "",
    `Gallery: ${absoluteUrl("/gallery")}`,
    textFooter(`Unsubscribe at any time: ${unsubscribeUrl}`),
  ].join("\n");

  return {
    subject,
    html: shell(subject, body, {
      kicker: "Conscius Omnium™ letter",
      preheader: "Occasional notes from the studio — new work, exhibitions, process.",
      footerLinks: [
        { label: "Gallery", href: absoluteUrl("/gallery") },
        { label: "About", href: absoluteUrl("/about") },
        { label: "Contact", href: absoluteUrl("/contact") },
      ],
      footerNote: `You are receiving this because you subscribed at consciusomnium.com. <a href="${unsubscribeUrl}" style="color:${PALETTE.inkFaint};">Unsubscribe or manage your preferences</a>.`,
    }),
    text,
  };
}

/* ═══════════════════ 4 · reusable campaign ═══════════════════════ */

/**
 * The reusable issue template. Everything is optional except the subject —
 * an issue can be one paragraph or a dozen sections with images and links,
 * and it composes to the same premium frame either way.
 */
export function newsletterCampaignEmail(
  campaign: Pick<
    NewsletterCampaign,
    "subject" | "preheader" | "intro" | "sections" | "ctaLabel" | "ctaHref"
  >,
  recipient: { token?: string | null; name?: string | null } = {},
): EmailMessage {
  const unsubscribeUrl = recipient.token
    ? absoluteUrl(`/unsubscribe?token=${encodeURIComponent(recipient.token)}`)
    : absoluteUrl("/unsubscribe");

  const sections = (campaign.sections ?? [])
    .map((section, i) => {
      const parts: string[] = [];
      if (i > 0) parts.push(rule(30));
      if (section.heading) {
        parts.push(
          `<h2 style="margin:0 0 14px;font-family:${FONT_DISPLAY};font-weight:400;font-size:20px;line-height:1.3;color:${PALETTE.ink};">${escapeHtml(section.heading)}</h2>`,
        );
      }
      if (section.imageUrl) {
        parts.push(
          `<img src="${escapeHtml(section.imageUrl)}" alt="${escapeHtml(section.imageCaption ?? section.heading ?? "")}" width="512" style="display:block;width:100%;max-width:512px;height:auto;margin:0 0 ${section.imageCaption ? 10 : 20}px;" />`,
        );
        if (section.imageCaption) {
          parts.push(
            `<p style="margin:0 0 20px;font-family:${FONT_SANS};font-size:11px;line-height:1.6;color:${PALETTE.inkFaint};">${escapeHtml(section.imageCaption)}</p>`,
          );
        }
      }
      if (section.body) parts.push(paragraphs(section.body));
      if (section.linkHref && section.linkLabel) {
        parts.push(spacer(4), ghostButton(section.linkLabel, section.linkHref));
      }
      return parts.join("");
    })
    .join("");

  const body = `
${eyebrow("Conscius Omnium™ letter", PALETTE.accent)}
${heading(campaign.subject)}
${campaign.intro ? paragraphs(campaign.intro) : ""}
${sections ? (campaign.intro ? rule(30) : spacer(8)) + sections : ""}
${campaign.ctaLabel && campaign.ctaHref ? spacer(30) + button(campaign.ctaLabel, campaign.ctaHref) : ""}
`;

  const text = [
    campaign.subject,
    "",
    campaign.intro ?? null,
    ...(campaign.sections ?? []).flatMap((s) =>
      [
        "",
        s.heading ? s.heading.toUpperCase() : null,
        s.body || null,
        s.linkHref && s.linkLabel ? `${s.linkLabel}: ${s.linkHref}` : null,
      ].filter((l): l is string => Boolean(l)),
    ),
    "",
    campaign.ctaLabel && campaign.ctaHref ? `${campaign.ctaLabel}: ${campaign.ctaHref}` : null,
    textFooter(`Unsubscribe: ${unsubscribeUrl}`),
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return {
    subject: campaign.subject,
    html: shell(campaign.subject, body, {
      preheader: campaign.preheader ?? campaign.intro?.slice(0, 140) ?? "",
      footerLinks: [
        { label: "Gallery", href: absoluteUrl("/gallery") },
        { label: "Studio", href: absoluteUrl("/studio") },
        { label: "Contact", href: absoluteUrl("/contact") },
      ],
      footerNote: `You are receiving this because you subscribed at consciusomnium.com. <a href="${unsubscribeUrl}" style="color:${PALETTE.inkFaint};">Unsubscribe or manage your preferences</a>.`,
    }),
    text,
  };
}
