import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/env";

// The client a page and a Server Action read and write with: the publishable key, so it is `anon`
// to Postgres and bounded by the grants of the migration of issue #210. One per request, and the
// cookie handlers are what is left of the session it used to carry.
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
