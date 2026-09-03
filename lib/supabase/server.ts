import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { env, isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Cookie-free anon client for reading PUBLIC content. Because it never
 * touches `cookies()`, routes that use it stay statically renderable /
 * ISR-cacheable. RLS still restricts it to published rows.
 */
let publicClient: ReturnType<typeof createClient<Database>> | null = null;
export function getSupabasePublicClient() {
  if (!isSupabaseConfigured) return null;
  if (publicClient) return publicClient;
  publicClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicClient;
}

/**
 * Server Supabase client bound to the request cookies (RLS-scoped to the
 * signed-in user). Returns null when Supabase isn't configured.
 */
export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore; middleware
          // refreshes the session.
        }
      },
    },
  });
}

/**
 * Service-role client. NEVER import into client components. Bypasses RLS —
 * use only in route handlers / server actions after an auth check, and in
 * the seed script.
 */
export function getSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured) return null;
  return createServerClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    cookies: {
      getAll: (): { name: string; value: string }[] => [],
      setAll: () => {},
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when the current request has an authenticated Supabase user. */
export async function getSessionUser() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
