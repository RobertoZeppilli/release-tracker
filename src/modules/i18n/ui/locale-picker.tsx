"use client";

import { usePathname } from "next/navigation";
import { barePath, LOCALE_NAMES, LOCALES, localePath } from "../domain/locales";
import { useLocale, useTranslator } from "./locale-context";

// The picker, in the foot of every page and on the Settings page (ADR 0008). The foot is what makes
// it reachable **by a visitor**, on a public page, at 390px: a choice a visitor cannot reach is a
// choice they have not got (DESIGN.md, No Dead End Rule). Settings repeats it because a signed-in
// reader looks for the language where the other preferences are, and the account panel sends them
// there with a line instead of carrying the five names itself.
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
export function LocalePicker({ variant }: { variant: "foot" | "page" }) {
  const current = useLocale();
  const t = useTranslator();
  const pathname = usePathname();
  const path = barePath(pathname);
  const title = t("shell.language");

  // On the Settings page the picker is a row of five controls under the heading the page gives it,
  // each 44px tall, which is the target size a choice made with the thumb asks for. The current one
  // is the only one filled: a page of settings has to say what is set, and `aria-current` alone says
  // it to a screen reader and to nobody else.
  if (variant === "page") {
    return (
      <ul className="mt-4 flex flex-wrap gap-2">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <a
              href={localePath(locale, path)}
              onClick={keepQuery}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={`inline-flex min-h-[44px] items-center rounded-md border px-3 font-mono text-label no-underline hover:border-text-faint hover:text-text ${
                locale === current ? "border-rule-strong bg-raised text-text" : "border-rule text-text-muted"
              }`}
            >
              {LOCALE_NAMES[locale]}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  // In the foot the picker is the fourth column above 640px and a wrapping row below it, and that
  // is one markup with the breakpoint doing the work. ⚠️ It was two sub-columns for a while, to keep
  // the foot from growing: five names in a column cost 11px, which the Dashboard was paying for
  // until its standing column was clamped by its own grid area (`standing-column.tsx`). On a phone
  // a column of five under two columns of three would have been a third of the foot's height for a
  // choice most readers make once, so there it lies down into a row across the width.
  return (
    <nav aria-label={title}>
      <h2 className="text-text-muted">{title}</h2>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-2">
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
