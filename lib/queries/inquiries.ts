import "server-only";

import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import type { InquiryNoteRow, InquiryRow } from "@/lib/supabase/database.types";

function mapInquiry(row: InquiryRow, notes: InquiryNoteRow[] = []): Inquiry {
  return {
    id: row.id,
    ref: row.ref,
    name: row.name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    type: row.type as Inquiry["type"],
    message: row.message,
    budget: row.budget,
    preferredContact: row.preferred_contact as Inquiry["preferredContact"],
    workSlug: row.work_slug,
    workTitle: row.work_title,
    status: row.status as InquiryStatus,
    notes: [...notes]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((n) => ({ id: n.id, body: n.body, createdAt: n.created_at })),
    createdAt: row.created_at,
  };
}

/** Admin: full enquiry list (RLS ensures only authenticated admins see this). */
export const getInquiries = cache(async (): Promise<Inquiry[]> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, inquiry_notes(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => {
    const { inquiry_notes, ...inquiry } = row as InquiryRow & {
      inquiry_notes: InquiryNoteRow[];
    };
    return mapInquiry(inquiry as InquiryRow, inquiry_notes ?? []);
  });
});

export const getInquiry = cache(async (id: string): Promise<Inquiry | null> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, inquiry_notes(*)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const { inquiry_notes, ...inquiry } = data as InquiryRow & {
    inquiry_notes: InquiryNoteRow[];
  };
  return mapInquiry(inquiry as InquiryRow, inquiry_notes ?? []);
});

export const getInquiryStats = cache(async () => {
  const inquiries = await getInquiries();
  const count = (s: InquiryStatus) => inquiries.filter((i) => i.status === s).length;
  return {
    total: inquiries.length,
    new: count("new"),
    unread: count("new"),
    inProgress: count("in-progress"),
    responded: count("responded"),
    closed: count("closed"),
    archived: count("archived"),
    recent: inquiries.slice(0, 6),
  };
});
