import "server-only";

import { headers } from "next/headers";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { sendNewsletterWelcome } from "@/lib/email/send";
import { getProfile } from "@/lib/queries/profile";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from "@/lib/validations/newsletter";

export type SubscribeOutcome = "subscribed" | "resubscribed" | "duplicate";

export type SubscribeResult =
  | {
      ok: true;
      outcome: SubscribeOutcome;
      /** Copy for the form's success state. */
      message: string;
      /** False when Supabase isn't configured — the welcome still goes out. */
      persisted: boolean;
      emailed: boolean;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/* ── per-instance rate limit, same shape as the enquiry form's ── */
const HITS = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

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

const MESSAGES: Record<SubscribeOutcome, string> = {
  subscribed: "You're on the list. A welcome note is on its way to your inbox.",
  resubscribed: "Welcome back — your subscription is active again.",
  duplicate: "You're already subscribed with this address. Nothing more to do.",
};

/**
 * Subscribe an address to the studio letter.
 *
 * Duplicates are resolved inside Postgres by `newsletter_subscribe()` — a
 * unique index on `lower(email)` makes a second row impossible, and the
 * function reports whether this was a new subscription, a return, or a repeat
 * so only genuine sign-ups trigger a welcome email.
 */
export async function subscribeToNewsletter(raw: unknown): Promise<SubscribeResult> {
  const parsed = newsletterSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      ok: false,
      error: fieldErrors.email?.[0] ?? "Please check the address and try again.",
      fieldErrors,
    };
  }
  const input: NewsletterSubscribeInput = parsed.data;

  // Spam gates.
  if (input.company && input.company.length > 0) {
    return { ok: false, error: "Submission rejected." };
  }
  if (typeof input.elapsedMs === "number" && input.elapsedMs < 800) {
    return { ok: false, error: "That was a little too quick — please try again." };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "local";
  if (!rateLimit(ip)) {
    return { ok: false, error: "Too many attempts just now. Please try again shortly." };
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const source = input.source?.trim() || "footer";

  let outcome: SubscribeOutcome = "subscribed";
  let token: string | null = null;
  let persisted = false;

  const supabase = isSupabaseConfigured ? getSupabasePublicClient() : null;
  if (supabase) {
    const { data, error } = await supabase.rpc("newsletter_subscribe", {
      p_email: email,
      p_name: name,
      p_source: source,
    });
    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[newsletter] subscribe failed:", error.message);
      }
      // The function is missing (migration 0005 not applied) or the address
      // was rejected by its own check — either way, say so plainly rather
      // than pretending the subscription worked.
      return {
        ok: false,
        error: "Subscriptions are temporarily unavailable. Please try again later.",
      };
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.outcome) outcome = row.outcome as SubscribeOutcome;
    token = row?.token ?? null;
    persisted = true;
  }

  // Already subscribed — do not send another welcome.
  if (outcome === "duplicate") {
    return { ok: true, outcome, message: MESSAGES.duplicate, persisted, emailed: false };
  }

  const profile = await getProfile().catch(() => null);
  const result = await sendNewsletterWelcome(
    {
      email,
      name,
      token: token ?? crypto.randomUUID().replace(/-/g, ""),
      resubscribed: outcome === "resubscribed",
    },
    profile,
  );

  return {
    ok: true,
    outcome,
    message: MESSAGES[outcome],
    persisted,
    emailed: result.ok,
  };
}

/**
 * Raw subscribe, without the spam gates or the welcome email — used by
 * Admin → Newsletter to add an address by hand.
 */
export async function subscribeDirect(
  email: string,
  name?: string | null,
  source = "admin",
): Promise<{ ok: true; outcome: SubscribeOutcome; token: string | null } | { ok: false; error: string }> {
  const supabase = isSupabaseConfigured ? getSupabasePublicClient() : null;
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  const { data, error } = await supabase.rpc("newsletter_subscribe", {
    p_email: email.trim().toLowerCase(),
    p_name: name?.trim() || null,
    p_source: source,
  });
  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    ok: true,
    outcome: (row?.outcome as SubscribeOutcome) ?? "subscribed",
    token: row?.token ?? null,
  };
}

export type UnsubscribeOutcome = "unsubscribed" | "already" | "unknown" | "unavailable";

/** Turn a token from an email footer into an unsubscription. */
export async function unsubscribeByToken(
  token: string,
): Promise<{ outcome: UnsubscribeOutcome; email?: string | null }> {
  const clean = token.trim();
  if (!clean) return { outcome: "unknown" };

  const supabase = isSupabaseConfigured ? getSupabasePublicClient() : null;
  if (!supabase) return { outcome: "unavailable" };

  const { data, error } = await supabase.rpc("newsletter_unsubscribe", { p_token: clean });
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[newsletter] unsubscribe failed:", error.message);
    }
    return { outcome: "unavailable" };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    outcome: (row?.outcome as UnsubscribeOutcome) ?? "unknown",
    email: row?.email ?? null,
  };
}
