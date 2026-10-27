import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { loginPath } from "@/modules/auth";
import { DEFAULT_LOCALE, isLocale, stripLocale } from "@/modules/i18n";

// Next 16 renamed Middleware to Proxy. It does two things, in this order: it puts the language in
// the path the router sees, and it is the early redirect for the signed-in pages, refreshing the
// session cookies on the way; the page itself still calls `requireDeveloper`, which is the
// authority (the Next docs are explicit that a proxy is not an authorization layer).
//
// ⚠️ Since ADR 0008 it runs on **every** page request, because every route lives under
// `app/[locale]` and English carries no prefix: `/technologies/vite` has to be rewritten to
// `/en/technologies/vite` for the router to find it. What the public pages still never pay is the
// **auth round trip to Supabase**, which is what the cost was: that stays on the paths below.
const PROTECTED = ["/account", "/settings", "/dashboard", "/technologies"];

function isProtected(path: string): boolean {
  return PROTECTED.includes(path);
}

function rewriteUrl(request: NextRequest, pathname: string): URL {
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return url;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const [, first = ""] = pathname.split("/");

  // `/en/faq` would be a second address for `/faq`, which is the one in the canonical, in the
  // sitemap and in every link: it is redirected, permanently, instead of being served twice.
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const { locale, path } = stripLocale(pathname);

  // Rewrite and not redirect: the reader keeps the address they typed, and only the router sees the
  // segment. A redirect here would make every English address bounce once.
  // ⚠️ Built by cloning the incoming URL, **not** from the pathname: a URL built from the path
  // alone drops the query string, and that is `?next=` on the login, `?week=` on the Digest and
  // every filter on the Catalog. Measured by six E2E before it was written this way.
  const rewritten = isLocale(first) ? null : rewriteUrl(request, pathname);

  if (!isProtected(path)) {
    return rewritten ? NextResponse.rewrite(rewritten) : NextResponse.next({ request });
  }

  let response = rewritten ? NextResponse.rewrite(rewritten, { request }) : NextResponse.next({ request });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = rewritten ? NextResponse.rewrite(rewritten, { request }) : NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    // The login in the language the Developer was reading, and `next` back to the same page.
    return NextResponse.redirect(new URL(loginPath(pathname, locale), request.nextUrl.origin));
  }
  return response;
}

// Everything but the paths that have no language of their own and must not be rewritten: the
// internals of Next, the route handlers (`next/root-params` does not even reach them), the OAuth
// callbacks, Slack's own round of #188, and the files served from the app root.
// ⚠️ **No clause against paths with a dot**: a Release page is `/technologies/vite/7.1.0`, and a
// rule that skipped dotted paths would be a rule that skipped the Releases. The files are named
// one by one instead.
export const config = {
  matcher: ["/((?!_next|api|auth|slack|icon.svg|sitemap.xml|robots.txt).*)"],
};
