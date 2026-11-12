import { type Locale, localePath, type Translator } from "@/modules/i18n";

// Where the landing ends: the Dashboard, which is where the reader's work is (DESIGN.md, The No
// Dead End Rule). It had two faces until issue #210, one of them the sign-in, and with the login
// gone there is one reader and one destination.
// A function and not a constant since ADR 0008: the address carries the language of the page it is
// read on, or the Italian landing would open the English Dashboard.
export const ENTRY_PATH = "/dashboard";

export function entryFace(locale: Locale, t: Translator): { href: string; label: string } {
  return { href: localePath(locale, ENTRY_PATH), label: t("landing.entry.developer") };
}
