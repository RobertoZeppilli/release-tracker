import type { MetadataRoute } from "next";
import { env } from "@/env";
import { LOCALES, localePath } from "@/modules/i18n";

// `/technologies$` and not `/technologies`: a plain prefix would shut out every Technology page
// under it. The `$` anchor is not in the original standard, but Google and Bing both read it, and
// the pages behind the login carry `robots: { index: false }` of their own as well.
// Every one of these exists in five languages since ADR 0008, and a rule written for the English
// address alone would leave `/it/dashboard` open to crawling. `/auth/`, `/api/` and `/test/` are
// outside the languages and are listed as they are.
const PRIVATE = ["/technologies$", "/dashboard", "/account", "/login"] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...PRIVATE.flatMap((path) => LOCALES.map((locale) => localePath(locale, path))),
        "/auth/",
        "/api/",
        "/test/",
      ],
    },
    sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
