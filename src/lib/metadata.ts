import type { Metadata } from "next";

// The working name, in the Open Graph `site_name` and nowhere else yet: the product name is still
// open (`docs/DECISIONI.md`) and the landing page decides it.
const SITE_NAME = "release-tracker";

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  // A Release is an `article`, a Technology page is the list of its Releases.
  type?: "article" | "website";
};

// Next.js emits `og:` tags only for what `openGraph` says, never from `title` and `description`,
// so a page that wants Open Graph has to repeat them. `path` is relative: `metadataBase` in the
// root layout makes it absolute, and a canonical built from the route carries no query string,
// which is how `?from=` stays out of the address search engines keep.
export function pageMetadata({ title, description, path, type = "article" }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, url: path, title, description, siteName: SITE_NAME },
  };
}
