"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "./auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSubscribers, getCampaign } from "@/lib/queries/newsletter";
import { subscribeDirect } from "@/lib/actions/newsletter";
import { getProfile } from "@/lib/queries/profile";
import { deliver, sendNewsletterCampaign } from "@/lib/email/send";
import {
  adminInquiryEmail,
  newsletterCampaignEmail,
  newsletterWelcomeEmail,
  visitorConfirmationEmail,
} from "@/lib/email/templates";
import { inboxForInquiryType, inboxForPurpose, NEWSLETTER_PURPOSE } from "@/lib/email/routing";
import { campaignSchema } from "@/lib/validations/newsletter";
import type { CampaignSection, Inquiry } from "@/lib/types";

export type ActionResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function db() {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function fail(e: z.ZodError): ActionResult {
  return {
    ok: false,
    error: "Please check the highlighted fields.",
    fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
  };
}

/** The table only exists once migration 0005 has been applied. */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const m = (error.message ?? "").toLowerCase();
  return m.includes("newsletter_") && (m.includes("does not exist") || m.includes("schema cache"));
}

const MIGRATION_HINT =
  "The newsletter tables are missing — run supabase/migrations/0005_newsletter.sql.";

/* ─────────────────────────── subscribers ─────────────────────────── */

export async function addSubscriber(formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email("Enter a valid email address"),
      name: z.string().trim().max(120).optional().or(z.literal("")),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);

  await requireAdmin();
  const result = await subscribeDirect(parsed.data.email, parsed.data.name || null, "admin");
  if (!result.ok) {
    return {
      ok: false,
      error: isMissingTable({ message: result.error }) ? MIGRATION_HINT : result.error,
    };
  }
  revalidatePath("/admin/newsletter");
  return {
    ok: true,
    message:
      result.outcome === "duplicate"
        ? "That address is already subscribed."
        : "Subscriber added. No welcome email was sent — sign-ups from the site trigger one.",
  };
}

export async function setSubscriberStatus(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "subscribed" && status !== "unsubscribed")) {
    return { ok: false, error: "Unknown subscriber." };
  }
  const supabase = await db();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status,
      unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null,
      subscribed_at: status === "subscribed" ? new Date().toISOString() : undefined,
    } as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/newsletter");
  return { ok: true, message: status === "subscribed" ? "Resubscribed" : "Unsubscribed" };
}

export async function deleteSubscriber(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Unknown subscriber." };
  const supabase = await db();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Subscriber deleted" };
}

/* ─────────────────────────── campaigns ───────────────────────────── */

function sectionsFromForm(formData: FormData): CampaignSection[] {
  const raw = String(formData.get("sections") ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CampaignSection[]) : [];
  } catch {
    return [];
  }
}

function campaignInput(formData: FormData) {
  return campaignSchema.safeParse({
    subject: String(formData.get("subject") ?? ""),
    preheader: String(formData.get("preheader") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    sections: sectionsFromForm(formData),
    ctaLabel: String(formData.get("ctaLabel") ?? ""),
    ctaHref: String(formData.get("ctaHref") ?? ""),
  });
}

export async function saveCampaign(formData: FormData): Promise<ActionResult> {
  const parsed = campaignInput(formData);
  if (!parsed.success) return fail(parsed.error);
  const v = parsed.data;
  const id = String(formData.get("id") ?? "").trim();
  const supabase = await db();

  const row = {
    subject: v.subject,
    preheader: v.preheader || null,
    intro: v.intro || null,
    body: v.sections,
    cta_label: v.ctaLabel || null,
    cta_href: v.ctaHref || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from("newsletter_campaigns")
      .update(row as never)
      .eq("id", id);
    if (error) return { ok: false, error: isMissingTable(error) ? MIGRATION_HINT : error.message };
    revalidatePath("/admin/newsletter");
    return { ok: true, message: "Draft saved", id };
  }

  const { data, error } = await supabase
    .from("newsletter_campaigns")
    .insert(row as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) return { ok: false, error: isMissingTable(error) ? MIGRATION_HINT : error.message };
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Draft created", id: data?.id };
}

export async function deleteCampaign(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Unknown issue." };
  const supabase = await db();
  const { error } = await supabase.from("newsletter_campaigns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Issue deleted" };
}

/** Send one issue to a single address, so it can be checked before it ships. */
export async function sendCampaignTest(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = campaignInput(formData);
  if (!parsed.success) return fail(parsed.error);

  const to = String(formData.get("testEmail") ?? "").trim();
  const address = z.string().email().safeParse(to);
  if (!address.success) return { ok: false, error: "Enter a valid test address." };

  const profile = await getProfile().catch(() => null);
  const message = newsletterCampaignEmail(
    { ...parsed.data, sections: parsed.data.sections as CampaignSection[] },
    { token: "preview" },
  );
  const result = await deliver({
    ...message,
    subject: `[Test] ${message.subject}`,
    to,
    replyTo: inboxForPurpose(NEWSLETTER_PURPOSE, profile),
  });
  if (result.skipped) return { ok: false, error: "Email isn't configured (RESEND_API_KEY)." };
  if (!result.ok) return { ok: false, error: result.error ?? "Send failed." };
  return { ok: true, message: `Test sent to ${to}` };
}

/**
 * Send an issue to every active subscriber. Idempotent per subscriber (the
 * delivery key is campaign + subscriber token), so a retry after a partial
 * failure never double-sends to anyone who already received it.
 */
export async function sendCampaign(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Save the issue as a draft before sending." };

  const campaign = await getCampaign(id);
  if (!campaign) return { ok: false, error: "That issue no longer exists." };

  const recipients = await getActiveSubscribers();
  if (!recipients.length) return { ok: false, error: "There are no active subscribers yet." };

  const profile = await getProfile().catch(() => null);
  const report = await sendNewsletterCampaign(campaign, recipients, profile);
  if (report.skipped) return { ok: false, error: "Email isn't configured (RESEND_API_KEY)." };

  const supabase = await db();
  await supabase
    .from("newsletter_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: report.sent,
      failed_count: report.failed,
    } as never)
    .eq("id", id);

  revalidatePath("/admin/newsletter");
  return {
    ok: true,
    message: report.failed
      ? `Sent to ${report.sent} of ${recipients.length}. ${report.failed} failed — see the log.`
      : `Sent to ${report.sent} subscriber${report.sent === 1 ? "" : "s"}.`,
    id,
  };
}

/* ──────────────────────── routing test sends ─────────────────────── */

const SAMPLE_MESSAGE =
  "This is a test of the Conscius Omnium enquiry emails. If you are reading it in your inbox, the route works — the layout, the details table and the reply button are exactly what a real enquiry produces.";

/** Build a realistic enquiry so a test exercises the real template. */
function sampleInquiry(overrides: Partial<Inquiry> = {}): Inquiry {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    ref: `CO-TEST-${new Date().toISOString().slice(11, 16).replace(":", "")}`,
    name: "Test Visitor",
    email: "visitor@example.com",
    phone: "+91 98765 43210",
    country: "India",
    type: "general",
    message: SAMPLE_MESSAGE,
    budget: null,
    preferredContact: "email",
    workSlug: null,
    workTitle: null,
    source: "contact-page",
    status: "new",
    notes: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Admin → Email routing. Sends whichever template is asked for to a chosen
 * address, so every route can be proved end to end from the panel.
 */
export async function sendRoutingTest(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const to = String(formData.get("testEmail") ?? "").trim();
  const kind = String(formData.get("kind") ?? "notification");
  const type = String(formData.get("type") ?? "general") as Inquiry["type"];

  const address = z.string().email().safeParse(to);
  if (!address.success) return { ok: false, error: "Enter a valid test address." };

  const profile = await getProfile().catch(() => null);
  const inquiry = sampleInquiry({ type, email: to });
  const inbox = inboxForInquiryType(type, profile).to;

  let message;
  if (kind === "confirmation") message = visitorConfirmationEmail(inquiry, { inbox });
  else if (kind === "welcome")
    message = newsletterWelcomeEmail({ email: to, name: "Test Visitor", token: "preview" });
  else message = adminInquiryEmail(inquiry, { inbox });

  const result = await deliver({
    ...message,
    subject: `[Test] ${message.subject}`,
    to,
    replyTo: inbox,
  });
  if (result.skipped) return { ok: false, error: "Email isn't configured (RESEND_API_KEY)." };
  if (!result.ok) return { ok: false, error: result.error ?? "Send failed." };
  return { ok: true, message: `Test sent to ${to} (route: ${inbox}).` };
}
