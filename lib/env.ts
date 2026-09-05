/**
 * Central, defensive access to environment configuration.
 * The site is designed to run with NONE of this set — every consumer
 * checks the relevant `is*Configured` flag and falls back to bundled
 * content or a no-op.
 */

import { SITE_URL } from "@/lib/site-url";

export { PRODUCTION_ORIGIN } from "@/lib/site-url";

export const env = {
  siteUrl: SITE_URL,

  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // Supabase renamed "anon key" → "publishable key"; accept either.
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "",
  // "service_role key" or the newer "secret key".
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "",

  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFrom:
    process.env.RESEND_FROM || "Conscius Omnium <onboarding@resend.dev>",
  /**
   * Optional override: pipe EVERY enquiry to one inbox. Leave unset and
   * `lib/email/routing.ts` routes by enquiry type to enquiry@ / info@ /
   * studio@ instead.
   */
  inquiryNotifyEmail: process.env.INQUIRY_NOTIFY_EMAIL?.trim() ?? "",

  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919972910950").replace(
    /[^\d]/g,
    "",
  ),

  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",

  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",

  revalidateSecret: process.env.REVALIDATE_SECRET ?? "",
};

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

/** Privileged writes (seed script, route handlers) need the service role. */
export const isSupabaseAdminConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceKey,
);

export const isEmailConfigured = Boolean(env.resendApiKey);

export const isAnalyticsConfigured = Boolean(env.gaId || env.plausibleDomain);
