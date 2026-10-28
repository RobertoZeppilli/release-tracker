import type { Metadata } from "next";
import { type Locale, localeAlternates, localePath } from "@/modules/i18n";

// The product's name (docs/DECISIONI.md). Without the article and without the colon the Brand Mark
// carries: `release-tracker` is only the name of the repository.
const SITE_NAME = "Verdict";

export type PageMeta = {
  title: string;
  description: string;
  // The path without a language prefix, the way the English page is addressed: the prefix of the
  // other four is added here, in one place, so no page writes `/it/...` by hand.
  path: string;
  locale: Locale;
  // A Release is an `article`, a Technology page is the list of its Releases.
  type?: "article" | "website";
  // Whether the page declares its four other addresses as translations of itself. Off for the
  // Release page, whose body is the same word for word in every language (ADR 0008, emendamento del
  // 2026-10-28). ⚠️ Dropping it from the sitemap alone would change nothing: Google crawls the URLs
  // an `hreflang` here names, so it has to be off in both places.
  hreflang?: boolean;
};

// Next.js emits `og:` tags only for what `openGraph` says, never from `title` and `description`,
// so a page that wants Open Graph has to repeat them. `path` is relative: `metadataBase` in the
// root layout makes it absolute, and a canonical built from the route carries no query string,
// which is how `?from=` stays out of the address search engines keep.
// `languages` is the `hreflang` set of a page that has one, and it is built from the same `path` as
// the canonical so the two cannot disagree: a page that declares itself canonical at one address and
// names a different one as its English version is a page search engines are right to distrust
// (ADR 0008).
export function pageMetadata({
  title,
  description,
  path,
  locale,
  type = "article",
  hreflang = true,
}: PageMeta): Metadata {
  const url = localePath(locale, path);
  return {
    title,
    description,
    // The canonical is there either way, and it names this page in the language it is being read
    // in: what `hreflang: false` drops is the set of the other four, not the page's own address.
    alternates: { canonical: url, ...(hreflang ? { languages: localeAlternates(path) } : {}) },
    openGraph: { type, url, title, description, siteName: SITE_NAME },
  };
}
