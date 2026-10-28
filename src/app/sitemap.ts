import type { MetadataRoute } from "next";
import { env } from "@/env";
import { createPublicClient } from "@/lib/supabase";
import { DEFAULT_LOCALE, LOCALES, localeAlternates, localePath } from "@/modules/i18n";
import { listSitemapPages } from "@/modules/releases/server";

// `revalidateReleasePages` marks the sitemap stale as soon as a Release is recorded or a Summary
// settles: that, and not the expiry, is how it keeps up with the pages it lists. The day is a floor
// under on-demand revalidation, in case a page is ever added without going through it.
export const revalidate = 86400;

const STATIC_PAGES = ["/terms", "/privacy", "/attributions", "/faq", "/contact"] as const;

// A sitemap with relative addresses is rejected: every entry is absolute.
function absolute(path: string): string {
  const url = new URL(path, env.NEXT_PUBLIC_SITE_URL);
  // The landing's own address, written the way Next resolves `/` against `metadataBase`, without
  // the trailing slash: the sitemap has to name the address the page declares as canonical.
  return path === "/" ? url.origin : url.toString();
}

// One entry per page per language, each naming the others (ADR 0008): `alternates.languages` is
// what tells a crawler that these five addresses are one page in five languages and not five pages
// saying the same thing. The addresses are built by `localePath`, the same function the canonical
// of each page is built from, so the sitemap cannot drift from the pages it lists.
function entry(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  const languages = localeAlternates(path);
  return LOCALES.map((locale) => ({
    url: absolute(localePath(locale, path)),
    ...(lastModified ? { lastModified } : {}),
    alternates: {
      languages: Object.fromEntries(
        Object.entries(languages).map(([key, value]) => [key, absolute(value)]),
      ),
    },
  }));
}

// A page whose body is the same word for word in every language is declared once, in the default
// one, with no `hreflang` (ADR 0008, emendamento del 2026-10-28). It is the Release page, and it is
// what the sitemap is made of: declaring its ~2.060 paths five times was ~80% of the ISR writes the
// plan includes. The page itself stays reachable, and correct, in all five languages.
function defaultLocaleEntry(path: string, lastModified: Date): MetadataRoute.Sitemap {
  return [
    {
      url: absolute(localePath(DEFAULT_LOCALE, path)),
      lastModified,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await listSitemapPages(createPublicClient());
  return [
    // The landing opens the sitemap, and it is the one entry with no `lastModified`: the page is
    // prerendered per deploy and the date it would carry would be the date of the build, which
    // says nothing about whether the page changed.
    ...entry("/"),
    // The five pages that say what the product is (issue #132). They carry no `lastModified` for
    // the same reason the landing does not: they change when their text is edited, which is a
    // deploy and not a row anything here could read.
    ...STATIC_PAGES.flatMap((path) => entry(path)),
    ...pages.flatMap(({ path, kind, lastModified }) =>
      kind === "release" ? defaultLocaleEntry(path, lastModified) : entry(path, lastModified),
    ),
  ];
}
