import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { serverEnv } from "@/env/server";

// Writes as the service role, which bypasses RLS: only for jobs, never for a Visitor's request.
export function createServiceClient(): SupabaseClient {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
