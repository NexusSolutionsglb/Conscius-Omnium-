import "server-only";

import { Resend } from "resend";
import { env, isEmailConfigured } from "@/lib/env";
import type { Inquiry, NewsletterCampaign, Profile } from "@/lib/types";
import { fromHeader, inboxForInquiryType, inboxForPurpose, NEWSLETTER_PURPOSE } from "./routing";
import {
  adminInquiryEmail,
  newsletterCampaignEmail,
  newsletterWelcomeEmail,
  visitorConfirmationEmail,
  type EmailMessage,
} from "./templates";

const resend = isEmailConfigured ? new Resend(env.resendApiKey) : null;

export type SendResult = {
  ok: boolean;
  /** Email isn't configured at all — not a failure, just a no-op. */
  skipped?: boolean;
  error?: string;
  to?: string;
};

type Deliverable = EmailMessage & {
  to: string;
  replyTo?: string;
  /** Set on transactional mail so a retry can never send twice. */
  idempotencyKey?: string;
};

const RETRYABLE = /rate.?limit|timeout|429|5\d\d|temporar|network|fetch failed|ECONN|socket/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One delivery, with a short retry for transient failures only. Never throws:
 * every caller runs after the visitor's submission is already safe, so a mail
 * problem must degrade rather than surface as an error.
 */
export async function deliver(message: Deliverable, attempts = 3): Promise<SendResult> {
  if (!resend) return { ok: false, skipped: true, to: message.to };

  let lastError = "send failed";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const { error } = await resend.emails.send(
        {
          from: fromHeader(),
          to: message.to,
          replyTo: message.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
        },
        message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined,
      );
      if (!error) return { ok: true, to: message.to };
      lastError = error.message;
      // A rejected address or malformed payload will fail identically on a
      // retry — only back off for the transient classes.
      if (!RETRYABLE.test(lastError) || attempt === attempts) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "send failed";
      if (attempt === attempts) break;
    }
    await sleep(attempt * 400);
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[email] ${message.to} — ${lastError}`);
  }
  return { ok: false, error: lastError, to: message.to };
}

/* ─── enquiries ──────────────────────────────────────────────────── */

export interface InquiryEmailOutcome {
  admin: SendResult;
  visitor: SendResult;
  /** The address the internal notification was routed to. */
  inbox: string;
}

/**
 * Fires both enquiry emails: the internal notification to the routed studio
 * inbox, and the visitor's confirmation. Both are attempted even if one
 * fails, and the enquiry is already persisted by the time this runs.
 */
export async function sendInquiryEmails(
  inquiry: Inquiry,
  profile?: Pick<Profile, "enquiryEmail" | "infoEmail" | "studioEmail"> | null,
): Promise<InquiryEmailOutcome> {
  const { to: inbox } = inboxForInquiryType(inquiry.type, profile);

  if (!isEmailConfigured) {
    return {
      admin: { ok: false, skipped: true, to: inbox },
      visitor: { ok: false, skipped: true, to: inquiry.email },
      inbox,
    };
  }

  const adminMessage = adminInquiryEmail(inquiry, { inbox });
  const visitorMessage = visitorConfirmationEmail(inquiry, { inbox });

  const [admin, visitor] = await Promise.all([
    deliver({
      ...adminMessage,
      to: inbox,
      replyTo: inquiry.email,
      // The reference is unique per enquiry, so a retried submission can
      // never produce a second notification.
      idempotencyKey: `inquiry-admin-${inquiry.ref}`,
    }),
    deliver({
      ...visitorMessage,
      to: inquiry.email,
      replyTo: inbox,
      idempotencyKey: `inquiry-visitor-${inquiry.ref}`,
    }),
  ]);

  return { admin, visitor, inbox };
}

/* ─── newsletter ─────────────────────────────────────────────────── */

export async function sendNewsletterWelcome(
  subscriber: { email: string; name?: string | null; token: string; resubscribed?: boolean },
  profile?: Pick<Profile, "enquiryEmail" | "infoEmail" | "studioEmail"> | null,
): Promise<SendResult> {
  if (!isEmailConfigured) return { ok: false, skipped: true, to: subscriber.email };
  const message = newsletterWelcomeEmail(subscriber);
  return deliver({
    ...message,
    to: subscriber.email,
    replyTo: inboxForPurpose(NEWSLETTER_PURPOSE, profile),
    // Re-subscribing later should be able to send again, so the key is scoped
    // to this subscription rather than to the address alone.
    idempotencyKey: `newsletter-welcome-${subscriber.token}`,
  });
}

export interface CampaignSendReport {
  sent: number;
  failed: number;
  skipped: boolean;
  failures: { email: string; error: string }[];
}

/**
 * Sends one issue to a list of subscribers, in small batches with a pause
 * between them so a large list doesn't trip the provider's rate limit.
 * Failures are collected rather than thrown — a bad address must not stop
 * the rest of the list.
 */
export async function sendNewsletterCampaign(
  campaign: Pick<
    NewsletterCampaign,
    "id" | "subject" | "preheader" | "intro" | "sections" | "ctaLabel" | "ctaHref"
  >,
  recipients: { email: string; name?: string | null; token: string }[],
  profile?: Pick<Profile, "enquiryEmail" | "infoEmail" | "studioEmail"> | null,
): Promise<CampaignSendReport> {
  if (!isEmailConfigured) {
    return { sent: 0, failed: 0, skipped: true, failures: [] };
  }

  const replyTo = inboxForPurpose(NEWSLETTER_PURPOSE, profile);
  const BATCH = 8;
  const report: CampaignSendReport = { sent: 0, failed: 0, skipped: false, failures: [] };

  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((recipient) => {
        const message = newsletterCampaignEmail(campaign, recipient);
        return deliver({
          ...message,
          to: recipient.email,
          replyTo,
          // One send per subscriber per issue, however often the action runs.
          idempotencyKey: `campaign-${campaign.id}-${recipient.token}`,
        });
      }),
    );
    results.forEach((result, j) => {
      if (result.ok) report.sent += 1;
      else {
        report.failed += 1;
        report.failures.push({ email: batch[j].email, error: result.error ?? "send failed" });
      }
    });
    if (i + BATCH < recipients.length) await sleep(600);
  }

  return report;
}

/** Used by Admin → Email routing to prove a route end to end. */
export async function sendTestEmail(to: string, message: EmailMessage): Promise<SendResult> {
  return deliver({ ...message, to });
}
