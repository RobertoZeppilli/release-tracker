import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/env";

// Reads the request cookies, so RLS sees the Developer as `authenticated`. One per request:
// a shared client would serve one Developer's session to another.
export async function createRequestClient(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) store.set(name, value, options);
        } catch {
          // A Server Component cannot write cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}
