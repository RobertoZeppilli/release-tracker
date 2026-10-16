"use client";

import { usePathname } from "next/navigation";
import { barePath, LOCALE_NAMES, LOCALES, localePath } from "../domain/locales";
import { useLocale, useTranslator } from "./locale-context";

// The picker, in the foot of every page and in the account panel (ADR 0008). The foot is what makes
// it reachable **by a visitor**, on a public page, at 390px: a choice a visitor cannot reach is a
// choice they have not got (DESIGN.md, No Dead End Rule). The panel repeats it because a signed-in
// reader looks for the language where the other settings are.
//
// ⚠️ It is a plain `a` and not `LocaleLink`, which is the one place in the app that is true:
// `LocaleLink` strips the prefix off a href and puts **the current language** back on, which is
// exactly what a picker must not do -- every entry would point at the page it is already on. A plain
// anchor also asks for a new document, so the `lang` on `html` and the dictionary of the layout
// arrive together, and it prefetches nothing: five languages prefetched from the foot of all 70
// pages is a lot of traffic for a choice most readers make once.
//
// ⚠️ The query belongs to the page -- `?next=` on the login, `?week=` on the Digest, the filters of
// the Catalog -- and `usePathname` does not carry it. It is written onto the anchor **as it is
// clicked**, through `HTMLAnchorElement.search`, which the browser reads when it follows the link:
// `useSearchParams` here would put this foot, which is in the root layout of every page, past the
// line where a static page starts rendering on demand, and that ISR is what ADR 0008 chose the
// prefix in the address to keep. Without JavaScript the bare path is still the right page in the
// right language, one query short.
function keepQuery(event: React.MouseEvent<HTMLAnchorElement>): void {
  const { search } = window.location;
  if (search) event.currentTarget.search = search;
}
export function LocalePicker({ variant }: { variant: "foot" | "panel" }) {
  const current = useLocale();
  const t = useTranslator();
  const pathname = usePathname();
  const path = barePath(pathname);
  const title = t("shell.language");

  if (variant === "panel") {
    return (
      <div className="border-t border-rule px-4 py-3 sm:mt-1 sm:px-3 sm:py-2">
        <h2 className="font-mono text-meta text-text-faint">{title}</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a
                href={localePath(locale, path)}
                onClick={keepQuery}
                aria-current={locale === current ? "true" : undefined}
                className={`inline-flex min-h-7 items-center rounded-md border px-2 font-mono text-label no-underline hover:border-text-faint hover:text-text ${
                  locale === current ? "border-rule-strong bg-raised text-text" : "border-rule text-text-muted"
                }`}
              >
                {LOCALE_NAMES[locale]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <nav aria-label={title}>
      <h2 className="text-text-muted">{title}</h2>
      {/* ⚠️ Two sub-columns, and not the one column the other cells of the foot are: five names in a
          column made the foot **46px taller than its tallest cell**, and the foot's height is read
          by the Dashboard. Its left column is `position: sticky`, and at the bottom of the document
          it sits a fixed distance under the top of the window, so every pixel the foot grows is a
          pixel further the column travels over the line under it. The E2E that measures that
          overlap (`dashboard.spec.ts`, "the columns apart") had **49px** of it in CI and 0 before,
          while in locale the same page is tall enough that nothing showed. Three rows plus the
          title is exactly the height of the `legal` cell, so the foot is the height it already was.
          ⚠️ The coupling is real and is written here because it is invisible from either side: a
          taller foot is a Dashboard regression until that sticky column is clamped by its own grid
          area instead of by the end of the page. */}
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <a
              href={localePath(locale, path)}
              onClick={keepQuery}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={`no-underline hover:text-text ${locale === current ? "text-text" : "text-text-faint"}`}
            >
              {LOCALE_NAMES[locale]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
