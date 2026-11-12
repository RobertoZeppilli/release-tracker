import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/modules/i18n";

// Next 16 renamed Middleware to Proxy. It does one thing now: it puts the language in the path the
// router sees. The other half, the early redirect of the signed-in pages and the refresh of the
// session cookies on the way, left with the login (issue #210, ADR 0011): an installed copy belongs
// to one person, so no page is behind anything and there is nobody to redirect.
//
// ⚠️ Since ADR 0008 it runs on **every** page request, because every route lives under
// `app/[locale]` and English carries no prefix: `/technologies/vite` has to be rewritten to
// `/en/technologies/vite` for the router to find it. What no page pays any more, public or not, is
// the **auth round trip to Supabase**: there is none left to pay.
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

  // Rewrite and not redirect: the reader keeps the address they typed, and only the router sees the
  // segment. A redirect here would make every English address bounce once.
  // ⚠️ Built by cloning the incoming URL, **not** from the pathname: a URL built from the path
  // alone drops the query string, and that is `?week=` on the Digest and every filter on the
  // Catalog. Measured by six E2E before it was written this way.
  if (isLocale(first)) return NextResponse.next({ request });
  return NextResponse.rewrite(rewriteUrl(request, pathname));
}

// Everything but the paths that have no language of their own and must not be rewritten: the
// internals of Next, the route handlers (`next/root-params` does not even reach them), Slack's own
// round of #188, and the files served from the app root. `auth` left the list with the routes it
// named (issue #210).
// ⚠️ **No clause against paths with a dot**: a Release page is `/technologies/vite/7.1.0`, and a
// rule that skipped dotted paths would be a rule that skipped the Releases. The files are named
// one by one instead.
export const config = {
  matcher: ["/((?!_next|api|slack|icon.svg|sitemap.xml|robots.txt).*)"],
};
