"use client";

import { useActionState } from "react";
import { type Locale, LOCALE_NAMES, LOCALES } from "@/modules/i18n";
import { useTranslator } from "@/modules/i18n/ui";
import { SeverityLabel } from "@/modules/releases/ui";
import type { LocaleSaved, SaveLocale } from "../domain/saving";

// The same five controls as the picker above it on this page, at the same 44px, because they are the
// same choice made twice: there the language of the page, which is an address to follow (ADR 0008);
// here the language Slack is written in, which has no address to read and so is a value
// to save (ADR 0009). The look is shared on purpose, and what separates them is that one is a row of
// links and this is a row of presses, with the saved one marked.
const CHOICE =
  "inline-flex min-h-[44px] items-center rounded-md border px-3 font-mono text-label hover:border-text-faint hover:text-text";
const SAVED = "border-rule-strong bg-raised text-text";
const OTHER = "border-rule text-text-muted";

const ERROR_ID = "preferred-locale-error";

export function PreferredLocaleChoice({ saved, action }: { saved: Locale; action: SaveLocale }) {
  const t = useTranslator();
  const [state, save, pending] = useActionState<LocaleSaved, FormData>(action, {
    status: "idle",
    locale: saved,
  });
  const failed = state.status === "failed";

  return (
    <form action={save}>
      {/* No optimistic mark here: which of the five is pending is not something `useActionState`
          says, and a row where two look chosen for an instant says less than one that waits. The
          wait is announced instead, on the list the presses are in. */}
      <ul aria-busy={pending || undefined} className="mt-4 flex flex-wrap gap-2">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <button
              type="submit"
              name="locale"
              value={locale}
              aria-pressed={state.locale === locale}
              aria-label={t("settings.notifications.locale.choose", { name: LOCALE_NAMES[locale] })}
              aria-describedby={failed ? ERROR_ID : undefined}
              className={`${CHOICE} ${state.locale === locale ? SAVED : OTHER}`}
            >
              {LOCALE_NAMES[locale]}
            </button>
          </li>
        ))}
      </ul>
      {failed && (
        <p id={ERROR_ID} role="alert" className="mt-3 font-mono text-diagnostic text-breaking">
          <SeverityLabel tone="breaking" label="error:" />{" "}
          <span className="inline-block">{t("settings.notifications.locale.error")}</span>
        </p>
      )}
    </form>
  );
}
