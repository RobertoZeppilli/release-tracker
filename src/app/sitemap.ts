import type { MetadataRoute } from "next";
import { env } from "@/env";
import { createPublicClient } from "@/lib/supabase";
import { listSitemapPages } from "@/modules/releases/server";

// ISR like the pages it lists, and `revalidateReleasePages` marks it stale as soon as a Release is
// recorded or a Summary settles, so the sitemap never lags behind the pages by an hour.
export const revalidate = 3600;

// The landing opens the sitemap, and it is the one entry with no `lastModified`: the page is
// prerendered per deploy and the date it would carry would be the date of the build, which says
// nothing about whether the page changed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await listSitemapPages(createPublicClient());
  // A sitemap with relative addresses is rejected: every entry is absolute.
  // The landing's own address, written the way Next resolves `/` against `metadataBase`, without
  // the trailing slash: the sitemap has to name the address the page declares as canonical.
  return [
    { url: new URL(env.NEXT_PUBLIC_SITE_URL).origin },
    ...pages.map(({ path, lastModified }) => ({
      url: new URL(path, env.NEXT_PUBLIC_SITE_URL).toString(),
      lastModified,
    })),
  ];
}
