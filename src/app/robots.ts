import type { MetadataRoute } from "next";
import { env } from "@/env";

// `/technologies$` and not `/technologies`: a plain prefix would shut out every Technology page
// under it. The `$` anchor is not in the original standard, but Google and Bing both read it, and
// the pages behind the login carry `robots: { index: false }` of their own as well.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/technologies$", "/dashboard", "/login", "/auth/", "/api/", "/test/"],
    },
    sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
