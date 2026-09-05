import "server-only";

import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CampaignSection,
  NewsletterCampaign,
  NewsletterSubscriber,
  SubscriberStatus,
} from "@/lib/types";
import type {
  NewsletterCampaignRow,
  NewsletterSubscriberRow,
} from "@/lib/supabase/database.types";

function mapSubscriber(row: NewsletterSubscriberRow): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: (row.status as SubscriberStatus) ?? "subscribed",
    source: row.source,
    subscribedAt: row.subscribed_at,
    unsubscribedAt: row.unsubscribed_at,
    createdAt: row.created_at,
  };
}

function mapCampaign(row: NewsletterCampaignRow): NewsletterCampaign {
  return {
    id: row.id,
    subject: row.subject,
    preheader: row.preheader,
    intro: row.intro,
    sections: Array.isArray(row.body) ? (row.body as unknown as CampaignSection[]) : [],
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    status: row.status === "sent" ? "sent" : "draft",
    sentAt: row.sent_at,
    sentCount: row.sent_count ?? 0,
    failedCount: row.failed_count ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * Admin: every subscriber. RLS restricts the table to admins, so an
 * unauthenticated read simply comes back empty rather than leaking the list.
 */
export const getSubscribers = cache(async (): Promise<NewsletterSubscriber[]> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as NewsletterSubscriberRow[]).map(mapSubscriber);
});

/** Only the addresses an issue should actually go to. */
export async function getActiveSubscribers(): Promise<
  { email: string; name: string | null; token: string }[]
> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, name, token")
    .eq("status", "subscribed")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as { email: string; name: string | null; token: string }[];
}

export const getSubscriberStats = cache(async () => {
  const subscribers = await getSubscribers();
  const active = subscribers.filter((s) => s.status === "subscribed");
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return {
    total: subscribers.length,
    active: active.length,
    unsubscribed: subscribers.length - active.length,
    last30: subscribers.filter((s) => new Date(s.createdAt).getTime() >= since).length,
    recent: subscribers.slice(0, 5),
  };
});

export const getCampaigns = cache(async (): Promise<NewsletterCampaign[]> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as NewsletterCampaignRow[]).map(mapCampaign);
});

export const getCampaign = cache(async (id: string): Promise<NewsletterCampaign | null> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapCampaign(data as NewsletterCampaignRow);
});
