import { absoluteUrl } from "@/lib/utils";

/**
 * The Conscius Omnium email design system.
 *
 * Every email the site sends is composed from these primitives so the
 * register stays identical to the website: a paper ground, a hairline rule,
 * a serif display face and wide-tracked uppercase eyebrows.
 *
 * Written for email clients, not browsers — tables for layout, inline styles
 * only. The one `<style>` block carries the mobile media query and nothing
 * structural, so a client that drops it still renders correctly.
 */

export const PALETTE = {
  paper: "#ffffff",
  ground: "#f4f3f1",
  ink: "#111111",
  inkSoft: "#3a3a3a",
  inkMute: "#6a6a6a",
  inkFaint: "#9a9a9a",
  line: "rgba(17,17,17,0.12)",
  lineSoft: "rgba(17,17,17,0.08)",
  accent: "#8a6a4a",
} as const;

export const FONT_DISPLAY = "Georgia,'Times New Roman',Times,serif";
export const FONT_SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const WORDMARK = "Conscius&nbsp;Omnium&trade;";
const WORDMARK_PLAIN = "Conscius Omnium™";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escapes, then turns blank-line-separated text into styled paragraphs. */
export function paragraphs(
  text: string,
  style = `margin:0 0 16px;font-family:${FONT_SANS};font-size:15px;line-height:1.75;color:${PALETTE.inkSoft};`,
): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="${style}">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/* ── building blocks ─────────────────────────────────────────────── */

/** An uppercase, wide-tracked label — the site's `.u-eyebrow`. */
export function eyebrow(text: string, color: string = PALETTE.inkFaint): string {
  return `<p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${color};">${escapeHtml(text)}</p>`;
}

export function heading(text: string, size = 26): string {
  return `<h1 class="co-h1" style="margin:0 0 18px;font-family:${FONT_DISPLAY};font-weight:400;font-size:${size}px;line-height:1.24;color:${PALETTE.ink};">${escapeHtml(text)}</h1>`;
}

/** A paragraph whose content is already-safe HTML. */
export function lead(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:15px;line-height:1.75;color:${PALETTE.inkSoft};">${html}</p>`;
}

/** A hairline divider, matching the site's `border-line`. */
export function rule(space = 28): string {
  return `<div style="height:${space}px;line-height:${space}px;font-size:0;">&nbsp;</div><div style="height:1px;line-height:1px;font-size:0;background:${PALETTE.line};">&nbsp;</div><div style="height:${space}px;line-height:${space}px;font-size:0;">&nbsp;</div>`;
}

export function spacer(height: number): string {
  return `<div style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</div>`;
}

/** A solid call to action. */
export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 0;"><tr>
<td style="background:${PALETTE.ink};">
<a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

export function ghostButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 0;"><tr>
<td style="border:1px solid ${PALETTE.ink};">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${PALETTE.ink};text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

/** A label/value row for `detailTable`. An empty value drops the row. */
export function detailRow(label: string, value?: string | null): string {
  if (!value) return "";
  return `<tr>
<td class="co-label" style="padding:11px 16px 11px 0;font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${PALETTE.inkFaint};width:150px;vertical-align:top;border-bottom:1px solid ${PALETTE.lineSoft};">${escapeHtml(label)}</td>
<td class="co-value" style="padding:11px 0;font-family:${FONT_SANS};font-size:14px;line-height:1.55;color:${PALETTE.ink};vertical-align:top;border-bottom:1px solid ${PALETTE.lineSoft};">${value}</td>
</tr>`;
}

/** Same, but the value is rendered as a live link (mailto:, tel:, https:). */
export function detailLinkRow(
  label: string,
  value: string | null | undefined,
  href: string,
): string {
  if (!value) return "";
  return detailRow(
    label,
    `<a href="${href}" style="color:${PALETTE.ink};text-decoration:none;border-bottom:1px solid ${PALETTE.line};">${escapeHtml(value)}</a>`,
  );
}

export function detailTable(rows: string): string {
  const inner = rows.trim();
  if (!inner) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${inner}</table>`;
}

/** A quoted block — used for the visitor's own message. */
export function quote(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.ground};border-left:2px solid ${PALETTE.ink};"><tr>
<td style="padding:20px 22px;font-family:${FONT_SANS};font-size:14px;line-height:1.8;color:${PALETTE.inkSoft};white-space:pre-wrap;">${escapeHtml(text)}</td>
</tr></table>`;
}

/** A numbered "what happens next" list. Items are already-safe HTML. */
export function steps(items: string[]): string {
  return items
    .map(
      (item, i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="34" style="padding:0 0 14px;font-family:${FONT_DISPLAY};font-size:13px;color:${PALETTE.accent};vertical-align:top;">${String(i + 1).padStart(2, "0")}</td>
<td style="padding:0 0 14px;font-family:${FONT_SANS};font-size:14px;line-height:1.7;color:${PALETTE.inkSoft};">${item}</td>
</tr></table>`,
    )
    .join("");
}

/* ── the shell ───────────────────────────────────────────────────── */

export interface ShellOptions {
  /** Shown in the inbox preview line, after the subject. */
  preheader?: string;
  /** Small label above the wordmark (e.g. "Enquiry received"). */
  kicker?: string;
  /** Extra links in the footer bar. */
  footerLinks?: { label: string; href: string }[];
  /** Appended under the footer rule — unsubscribe copy, legal notes. */
  footerNote?: string;
  /** The studio address this email came from, shown in the footer. */
  replyTo?: string;
}

/**
 * Wraps body HTML in the branded frame: hidden preheader, wordmark header,
 * content card, footer with contact details and links.
 */
export function shell(title: string, body: string, options: ShellOptions = {}): string {
  const { preheader, kicker, footerLinks = [], footerNote, replyTo } = options;
  const site = absoluteUrl("/");
  const siteLabel = site.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const links = footerLinks
    .map(
      (l) =>
        `<a href="${l.href}" style="color:${PALETTE.inkMute};text-decoration:none;border-bottom:1px solid ${PALETTE.line};">${escapeHtml(l.label)}</a>`,
    )
    .join(`<span style="color:${PALETTE.inkFaint};"> &nbsp;&middot;&nbsp; </span>`);

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(title)}</title>
<style>
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  @media only screen and (max-width:620px) {
    .co-wrap { width:100% !important; }
    .co-pad { padding-left:24px !important; padding-right:24px !important; }
    .co-h1 { font-size:22px !important; }
    /* Detail rows stack — a 150px label column is unreadable at 320px. */
    .co-label { display:block !important; width:100% !important; padding:14px 0 2px !important; border-bottom:0 !important; }
    .co-value { display:block !important; width:100% !important; padding:0 0 12px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PALETTE.ground};">
<div style="display:none;font-size:1px;color:${PALETTE.ground};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader ?? "")}&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.ground};">
<tr><td align="center" style="padding:40px 12px;">

<table role="presentation" class="co-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${PALETTE.paper};border:1px solid ${PALETTE.line};">

  <tr><td class="co-pad" style="padding:36px 44px 28px;border-bottom:1px solid ${PALETTE.line};">
    ${kicker ? `<p style="margin:0 0 14px;font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${PALETTE.accent};">${escapeHtml(kicker)}</p>` : ""}
    <a href="${site}" style="text-decoration:none;">
      <div style="font-family:${FONT_DISPLAY};font-size:17px;letter-spacing:0.26em;text-transform:uppercase;color:${PALETTE.ink};">${WORDMARK}</div>
      <div style="margin-top:7px;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${PALETTE.inkFaint};">Shivjeet Potdar &nbsp;&middot;&nbsp; Bengaluru</div>
    </a>
  </td></tr>

  <tr><td class="co-pad" style="padding:38px 44px 42px;font-family:${FONT_SANS};">${body}</td></tr>

  <tr><td class="co-pad" style="padding:26px 44px 30px;border-top:1px solid ${PALETTE.line};background:${PALETTE.ground};">
    <p style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:${PALETTE.ink};">${WORDMARK}</p>
    <p style="margin:0 0 12px;font-family:${FONT_SANS};font-size:12px;line-height:1.7;color:${PALETTE.inkMute};">
      <a href="${site}" style="color:${PALETTE.inkMute};text-decoration:none;border-bottom:1px solid ${PALETTE.line};">${escapeHtml(siteLabel)}</a>${
        replyTo
          ? `<span style="color:${PALETTE.inkFaint};"> &nbsp;&middot;&nbsp; </span><a href="mailto:${replyTo}" style="color:${PALETTE.inkMute};text-decoration:none;border-bottom:1px solid ${PALETTE.line};">${escapeHtml(replyTo)}</a>`
          : ""
      }
    </p>
    ${links ? `<p style="margin:0 0 12px;font-family:${FONT_SANS};font-size:12px;line-height:1.7;color:${PALETTE.inkMute};">${links}</p>` : ""}
    ${
      footerNote
        ? `<p style="margin:12px 0 0;padding-top:12px;border-top:1px solid ${PALETTE.line};font-family:${FONT_SANS};font-size:11px;line-height:1.7;color:${PALETTE.inkFaint};">${footerNote}</p>`
        : ""
    }
  </td></tr>

</table>

<p style="margin:18px 0 0;font-family:${FONT_SANS};font-size:11px;color:${PALETTE.inkFaint};">${WORDMARK_PLAIN} — awareness through art.</p>

</td></tr>
</table>
</body>
</html>`;
}

/** Plain-text footer used by every text alternative. */
export function textFooter(extra?: string | null): string {
  return [
    "",
    "—",
    WORDMARK_PLAIN,
    "Shivjeet Potdar · Bengaluru, India",
    absoluteUrl("/"),
    extra ?? null,
  ]
    .filter((l): l is string => Boolean(l))
    .join("\n");
}
