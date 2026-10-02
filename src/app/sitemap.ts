import type { MetadataRoute } from "next";
import { env } from "@/env";
import { createPublicClient } from "@/lib/supabase";
import { listSitemapPages } from "@/modules/releases/server";

// ISR like the pages it lists, and `revalidateReleasePages` marks it stale as soon as a Release is
// recorded or a Summary settles, so the sitemap never lags behind the pages by an hour.
export const revalidate = 3600;

// The home page is missing on purpose: until the landing page (#26) replaces the token specimen,
// `/` is `noindex` and belongs in no sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await listSitemapPages(createPublicClient());
  // A sitemap with relative addresses is rejected: every entry is absolute.
  return pages.map(({ path, lastModified }) => ({
    url: new URL(path, env.NEXT_PUBLIC_SITE_URL).toString(),
    lastModified,
  }));
}
