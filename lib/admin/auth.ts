import "server-only";

import { redirect } from "next/navigation";
import { getSessionUser, getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type AdminGate =
  | { state: "unconfigured" }
  | { state: "signed-out" }
  | { state: "ok"; user: { id: string; email: string | null } };

/**
 * Resolves the admin session. `/admin/*` pages call this; middleware
 * already redirects signed-out users, this is the defence in depth +
 * the "Supabase not set up yet" branch.
 */
export async function resolveAdmin(): Promise<AdminGate> {
  if (!isSupabaseConfigured) return { state: "unconfigured" };
  const user = await getSessionUser();
  if (!user) return { state: "signed-out" };
  return { state: "ok", user: { id: user.id, email: user.email ?? null } };
}

/** Use inside server actions — throws (via redirect) if not an admin. */
export async function requireAdmin() {
  const gate = await resolveAdmin();
  if (gate.state === "unconfigured") redirect("/admin");
  if (gate.state === "signed-out") redirect("/admin/login");
  return gate.user;
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
}
