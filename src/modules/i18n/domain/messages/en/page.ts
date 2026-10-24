// The titles and the descriptions of the pages, which are interface too: a tab, a bookmark and a
// search result read them. They are one namespace and not one per page because a title is the same
// kind of string wherever it sits, and because this is the list to read when asking whether a page
// has been translated at all. The two diagnostic pages are here for the same reason: they are what
// a page says when there is no page.
// ⚠️ `Dashboard` stays `Dashboard` in Italian: the glossary's own column says so (GLOSSARY.md, and
// ADR 0008's correction), and a name a language already uses is not translated for the sake of it.
export const page = {
  // The landing carries the product name inside its own title, which is why the layout's `%s · Verdict`
  // is turned off for this one page: it would say the name twice.
  "page.landing.title": "Verdict, understand before you upgrade",
  "page.landing.description":
    "Verdict follows the releases of the technologies in your stack and gives each one a single verdict: whether it asks something of you, what breaks, and how to migrate, with every claim pointing at the line of the release notes it was read from.",
  "page.dashboard.title": "Dashboard",
  "page.technologies.title": "Technologies",
  "page.account.title": "Account",
  "page.login.title": "Sign in",
  "page.login.description":
    "Sign in with GitHub to follow technologies and see your dashboard.",
  // The five document pages. Their title is read twice, as the tab and as the heading of the page
  // itself, so it is one key and not two: a heading that drifts from its tab is a page that answers
  // to two names.
  "page.faq.title": "FAQ",
  "page.faq.description":
    "What Verdict follows, what an account is for, and how far a generated summary can be trusted.",
  "page.terms.title": "Terms of service",
  "page.terms.description":
    "What Verdict is, what the free plan holds, and why a generated summary always shows the line it was read from.",
  "page.privacy.title": "Privacy",
  "page.privacy.description":
    "Everything Verdict holds about a developer, who touches it, and why no personal data ever enters a prompt.",
  "page.attributions.title": "Attributions",
  "page.attributions.description":
    "Where the technology marks, the release notes, the typefaces and the icons in Verdict come from, and under which licence.",
  "page.contact.title": "Contact",
  "page.contact.description": "One address, answered by the person who runs Verdict.",
  // A Technology page and a Release page are public and indexed, so their description is read by
  // people who have not arrived yet. The Technology's own description comes from the Catalog, which
  // is data and stays as it was curated.
  "page.technology.title": "{name} releases",
  "page.technology.holds":
    "Every {name} release, with a summary of what changed when there is one.",
  "page.technology.described": "{description} {holds}",
  "page.release.title": "{name} {version} release",
  "page.release.published": "{name} {version}, published {date}.",
  "page.release.notesOnly":
    "{published} The release notes as published, not yet summarized.",
  // The wait, said for a reader who is not watching the screen (DESIGN.md, The Waiting Rule).
  "page.opening": "opening {name}",
  // The absence of a page is not a failure, so it carries `note:` and no ink.
  "page.notFound.claim": "no page at this address",
  "page.notFound.body":
    "Nothing went wrong. This address names no technology in the catalog, or a version with no release of its own: the catalog is curated, and a release gets a page once it is detected.",
  "page.browseCatalog": "browse the catalog",
  "page.error.claim": "this page could not be loaded",
  "page.error.body":
    "Something on our side failed while rendering this page. Nothing was saved and nothing changed, so trying again is safe.",
  "page.error.retry": "Try again",
  // The digest, which is what matches this failure to its line in the server log.
  "page.error.reference": "reference {digest}",
} as const;
