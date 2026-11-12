import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/env";

// The client the browser reads and writes the follows and the Notifications with, without making a
// public page dynamic (`follows-store`, `notifications-store`). There is no session in it since the
// login left (issue #210): it is `anon`, and the grants are what bound it.
export function createSessionClient(): SupabaseClient {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
