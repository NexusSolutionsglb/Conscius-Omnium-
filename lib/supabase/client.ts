"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Browser Supabase client (anon key). Returns null when Supabase isn't
 * configured so callers degrade gracefully instead of throwing.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
  );
  return browserClient;
}
