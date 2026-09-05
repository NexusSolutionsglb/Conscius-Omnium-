import "server-only";

import { headers } from "next/headers";
import {
  getSupabaseAdminClient,
  getSupabasePublicClient,
} from "@/lib/supabase/server";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { sendInquiryEmails } from "@/lib/email/send";
import { getProfile } from "@/lib/queries/profile";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { INQUIRY_TYPE_LABELS, type Inquiry } from "@/lib/types";
import { makeRef } from "@/lib/utils";
import { whatsappInquiryMessage, whatsappLink } from "@/lib/whatsapp";

export type InquiryResult =
  | {
      ok: true;
      ref: string;
      whatsappUrl: string;
      persisted: boolean;
      emailed: boolean;
      /** The studio address the notification was routed to. */
      routedTo: string;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/* ── very small in-memory rate limiter (per warm instance) ── */
const HITS = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = HITS.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    HITS.set(key, { count: 1, first: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

/** True when the `source` column hasn't been added yet (migration 0005). */
function isMissingSourceColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST204" || error.code === "42703") return true;
  const m = (error.message ?? "").toLowerCase();
  return m.includes("source") && (m.includes("does not exist") || m.includes("schema cache"));
}

export async function submitInquiry(raw: unknown): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const input: InquiryInput = parsed.data;

  // Spam gates — honeypot + minimum dwell time.
  if (input.company && input.company.length > 0) {
    return { ok: false, error: "Submission rejected." };
  }
  if (typeof input.elapsedMs === "number" && input.elapsedMs < 1200) {
    return { ok: false, error: "That was a little too quick — please try again." };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "local";
  if (!rateLimit(ip)) {
    return { ok: false, error: "Too many enquiries just now. Please try again shortly." };
  }

  const ref = makeRef("CO");
  const now = new Date().toISOString();

  const inquiry: Inquiry = {
    id: crypto.randomUUID(),
    ref,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    country: input.country || null,
    type: input.type,
    message: input.message,
    budget: input.budget || null,
    preferredContact: input.preferredContact ?? null,
    workSlug: input.workSlug || null,
    workTitle: input.workTitle || null,
    source: input.source ?? (input.workSlug ? "work-enquiry" : "contact-page"),
    status: "new",
    notes: [],
    createdAt: now,
  };

  // 1. Persist. Prefer the service-role client; fall back to the public
  //    client (the `inquiries public insert` RLS policy allows anon INSERT).
  let persisted = false;
  const hasServiceRole = isSupabaseAdminConfigured;
  const supabase = (
    hasServiceRole
      ? getSupabaseAdminClient()
      : isSupabaseConfigured
        ? getSupabasePublicClient()
        : null
  ) as ReturnType<typeof getSupabaseAdminClient>;

  if (supabase) {
    const insertRow = {
      ref: inquiry.ref,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      country: inquiry.country,
      type: inquiry.type,
      message: inquiry.message,
      budget: inquiry.budget,
      preferred_contact: inquiry.preferredContact,
      work_slug: inquiry.workSlug,
      work_title: inquiry.workTitle,
      source: inquiry.source,
      status: "new" as const,
    };
    // The hand-authored Database type doesn't fully satisfy postgrest-js's
    // insert generic; the column shape is guaranteed by the migration.
    //
    // `source` arrived in 0005 — on a database that predates it, drop the
    // column and save the enquiry anyway rather than losing it.
    const insert = async (row: Record<string, unknown>) => {
      if (hasServiceRole) {
        const { data, error } = await supabase
          .from("inquiries")
          .insert(row as never)
          .select("id")
          .maybeSingle<{ id: string }>();
        return { id: data?.id, error };
      }
      // Anon INSERT — RLS blocks the readback, so don't chain .select().
      const { error } = await supabase.from("inquiries").insert(row as never);
      return { id: undefined, error };
    };

    let result = await insert(insertRow);
    if (result.error && isMissingSourceColumn(result.error)) {
      const { source: _source, ...withoutSource } = insertRow;
      result = await insert(withoutSource);
    }
    if (!result.error) {
      if (result.id) inquiry.id = result.id;
      persisted = true;
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[inquiry] persist failed:", result.error.message);
    }
  }

  // 2. Email (never throws). The notification is routed by enquiry type to
  //    enquiry@ / info@ / studio@ — see `lib/email/routing.ts`.
  const profile = await getProfile().catch(() => null);
  const emails = await sendInquiryEmails(inquiry, profile);
  const emailed = emails.admin.ok || emails.visitor.ok;

  // 3. WhatsApp continuation link (share, not API).
  const whatsappUrl = whatsappLink(
    whatsappInquiryMessage({
      ref: inquiry.ref,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      typeLabel: INQUIRY_TYPE_LABELS[inquiry.type],
      message: inquiry.message,
      workTitle: inquiry.workTitle,
    }),
  );

  return { ok: true, ref, whatsappUrl, persisted, emailed, routedTo: emails.inbox };
}
