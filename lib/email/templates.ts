import { env } from "@/lib/env";
import { INQUIRY_TYPE_LABELS, type Inquiry } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

/**
 * Minimal, typographic email templates — the same quiet-luxury register
 * as the site. No response-time promises are made unless configured.
 */

const SHELL = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${title}</title></head>
<body style="margin:0;background:#f2f2f2;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#3a3a3a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(17,17,17,0.12);">
<tr><td style="padding:34px 36px 26px;border-bottom:1px solid rgba(17,17,17,0.10);">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:0.24em;text-transform:uppercase;color:#111111;">Conscius&nbsp;Omnium&trade;</div>
<div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7a7a;margin-top:6px;">Shivjeet Potdar</div>
</td></tr>
<tr><td style="padding:32px 36px 38px;">${body}</td></tr>
<tr><td style="padding:20px 36px;border-top:1px solid rgba(17,17,17,0.10);font-size:11px;color:#9a9a9a;">
${absoluteUrl("/")}
</td></tr>
</table></body></html>`;

const row = (label: string, value?: string | null) =>
  value
    ? `<tr>
<td style="padding:7px 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a7a7a;width:132px;vertical-align:top;">${label}</td>
<td style="padding:7px 0;font-size:14px;color:#111111;">${escapeHtml(value)}</td>
</tr>`
    : "";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function adminInquiryEmail(inquiry: Inquiry): { subject: string; html: string; text: string } {
  const typeLabel = INQUIRY_TYPE_LABELS[inquiry.type];
  const subject = inquiry.workTitle
    ? `New enquiry — ${inquiry.workTitle} (${inquiry.ref})`
    : `New enquiry — ${typeLabel} (${inquiry.ref})`;

  const heading = inquiry.workTitle
    ? `New enquiry about a work`
    : `New ${typeLabel.toLowerCase()}`;

  const body = `
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;line-height:1.25;color:#111111;margin:0 0 4px;">${heading}</h1>
<p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7a7a;margin:0 0 24px;">Reference ${inquiry.ref}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Work", inquiry.workTitle)}
${row("Type", typeLabel)}
${row("Name", inquiry.name)}
${row("Email", inquiry.email)}
${row("Phone", inquiry.phone)}
${row("Country", inquiry.country)}
${row("Budget", inquiry.budget)}
${row("Prefers", inquiry.preferredContact)}
</table>
<div style="margin:22px 0 26px;padding:18px 20px;background:#f2f2f2;border-left:2px solid #4a4a4a;font-size:14px;line-height:1.7;color:#3a3a3a;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>
<a href="${absoluteUrl(`/admin/inquiries/${inquiry.id}`)}" style="display:inline-block;background:#111111;color:#ffffff;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:14px 26px;text-decoration:none;">Open enquiry</a>
<p style="margin:20px 0 0;"><a href="mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your enquiry (${inquiry.ref})`)}" style="color:#4a4a4a;font-size:13px;">Reply by email</a></p>
`;

  const text = [
    heading,
    `Reference ${inquiry.ref}`,
    "",
    inquiry.workTitle ? `Work: ${inquiry.workTitle}` : null,
    `Type: ${typeLabel}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.country ? `Country: ${inquiry.country}` : null,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
    "",
    inquiry.message,
    "",
    absoluteUrl(`/admin/inquiries/${inquiry.id}`),
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html: SHELL(subject, body), text };
}

export function visitorConfirmationEmail(inquiry: Inquiry): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = inquiry.workTitle
    ? `Your enquiry — “${inquiry.workTitle}”`
    : `Your enquiry to Conscius Omnium™`;

  const line = inquiry.workTitle
    ? `Thank you for your enquiry regarding <strong style="color:#111111;">“${escapeHtml(inquiry.workTitle)}”</strong>.`
    : `Thank you for getting in touch with Conscius Omnium™.`;

  const body = `
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;line-height:1.3;color:#111111;margin:0 0 18px;">Thank you, ${escapeHtml(inquiry.name.split(" ")[0] || inquiry.name)}.</h1>
<p style="font-size:14px;line-height:1.75;margin:0 0 14px;">${line}</p>
<p style="font-size:14px;line-height:1.75;margin:0 0 14px;">Shivjeet's studio will read it personally and respond directly. Your reference is <strong style="color:#111111;letter-spacing:0.06em;">${inquiry.ref}</strong> — quote it in any follow-up.</p>
<div style="margin:22px 0;padding:16px 20px;background:#f2f2f2;font-size:13px;line-height:1.7;color:#6a6a6a;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>
<p style="font-size:13px;line-height:1.75;color:#6a6a6a;margin:18px 0 0;">If you'd rather continue on WhatsApp, reply to this email and let us know.</p>
`;

  const text = [
    `Thank you, ${inquiry.name.split(" ")[0] || inquiry.name}.`,
    "",
    inquiry.workTitle
      ? `Thank you for your enquiry regarding "${inquiry.workTitle}".`
      : `Thank you for getting in touch with Conscius Omnium™.`,
    "",
    `Shivjeet's studio will read it personally and respond directly.`,
    `Your reference is ${inquiry.ref}.`,
    "",
    "Your message:",
    inquiry.message,
    "",
    absoluteUrl("/"),
  ].join("\n");

  return { subject, html: SHELL(subject, body), text };
}

export const emailFrom = env.resendFrom;
