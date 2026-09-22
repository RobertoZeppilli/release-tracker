import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/env";

// Reads public content as `anon`: RLS allows only selects on the Catalog, Releases and Summaries.
export function createPublicClient(): SupabaseClient {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
