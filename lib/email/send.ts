import "server-only";

import { Resend } from "resend";
import { env, isEmailConfigured } from "@/lib/env";
import type { Inquiry } from "@/lib/types";
import { adminInquiryEmail, visitorConfirmationEmail } from "./templates";

const resend = isEmailConfigured ? new Resend(env.resendApiKey) : null;

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

async function deliver(args: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  if (!resend) return { ok: false, skipped: true };
  try {
    const { error } = await resend.emails.send({
      from: env.resendFrom,
      to: args.to,
      replyTo: args.replyTo,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "send failed" };
  }
}

/**
 * Fires both enquiry emails. Never throws — the enquiry is already
 * persisted by the time this runs, so a mail failure must not 500 the
 * visitor. Results are returned for logging.
 */
export async function sendInquiryEmails(inquiry: Inquiry) {
  if (!isEmailConfigured) {
    return { admin: { ok: false, skipped: true }, visitor: { ok: false, skipped: true } };
  }

  const admin = adminInquiryEmail(inquiry);
  const visitor = visitorConfirmationEmail(inquiry);

  const [adminResult, visitorResult] = await Promise.all([
    deliver({
      to: env.inquiryNotifyEmail,
      replyTo: inquiry.email,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
    }),
    deliver({
      to: inquiry.email,
      subject: visitor.subject,
      html: visitor.html,
      text: visitor.text,
    }),
  ]);

  return { admin: adminResult, visitor: visitorResult };
}
