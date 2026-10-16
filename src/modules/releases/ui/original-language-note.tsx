import { Info } from "lucide-react";
import { DEFAULT_LOCALE, type Locale, type Translator } from "@/modules/i18n";

// The line that says the page is mixed. With the interface in Italian and a Summary in English, a
// Release page is read in two languages, and ADR 0008 asks it to **declare that instead of letting
// the reader discover it**: the Release Notes are the original text of the project, kept character
// for character so every claim of a Summary points at the line it was read from, and the Summaries
// stay in English because translating them would be one more call to Anthropic per Release.
// It carries no ink and no surface: a page in two languages is a fact about the page, not a fault of
// it (DESIGN.md, the `note:` prefix).
// Nothing is said on the English pages, where there are not two languages to tell apart, and
// nothing is said on a page with no notes and no Summary, where there is no other language on the
// screen to declare.
//
// ⚠️ The language and the translator arrive as props and are not read from `i18n/server` here, the
// way `technologiesCrumb` takes `t`: this file is exported from the module's `ui` index, and a
// `server-only` import anywhere behind that index is one every client component importing the index
// inherits -- it broke `dashboard-copy.test.ts`, which imports no part of this.
export function OriginalLanguageNote({
  locale,
  t,
  hasContent,
}: {
  locale: Locale;
  t: Translator;
  hasContent: boolean;
}) {
  if (locale === DEFAULT_LOCALE || !hasContent) return null;

  return (
    <p role="note" className="mt-5 font-mono text-diagnostic text-text-muted">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note: <span className="text-text-muted">{t("release.originalLanguage")}</span>
    </p>
  );
}
