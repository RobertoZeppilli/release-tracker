import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { loginPath } from "@/modules/auth";

// Next 16 renamed Middleware to Proxy. This is the early redirect for the signed-in pages, and it
// refreshes the session cookies on the way; the page itself still calls `requireDeveloper`, which
// is the authority (the Next docs are explicit that a proxy is not an authorization layer).
// It runs only on the protected paths: the public pages are cached and must not pay for an
// auth round trip on every request.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.redirect(new URL(loginPath(request.nextUrl.pathname), request.nextUrl.origin));
  }
  return response;
}

// Exact paths: `/technologies/vite` is public and must never reach the login.
export const config = { matcher: ["/dashboard", "/technologies"] };
