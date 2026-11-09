import type { Locale } from "@/modules/i18n";

// The launch (`docs/DECISIONI.md`, "Il lancio: 20 gennaio 2027", and ADR 0010). One date, read in
// three places: the landing says it, the login page says it, and the door of the callback is shut
// while it is in the future. One constant, so a date that moves cannot move in two of the three.
//
// 08:00 UTC, which is nine in the morning where the product is written: a launch has an hour, and a
// date without one opens at midnight for nobody.
export const LAUNCH_AT = new Date("2027-01-20T08:00:00.000Z");

// The same day as a plain ISO day, for the `datetime` of a `<time>`: a machine reads the day, and
// the reader reads the sentence beside it in their own language.
export const LAUNCH_DAY = "2027-01-20";

// ⚠️ The door is derived from the date and not from a flag: a flag has to be remembered on the
// morning of the launch, and the one thing nobody forgets that morning is the date itself. So the
// door opens by itself, and moving the launch is editing `LAUNCH_AT` and nothing else.
export function doorClosed(now: Date): boolean {
  return now.getTime() < LAUNCH_AT.getTime();
}

// The day written out in the reader's language, which is how the landing and the login page name
// it: `20 gennaio 2027`, `January 20, 2027`, `20. Januar 2027`. The time zone is fixed to UTC so
// the prerendered page and the reader's browser name the same day, whatever the reader's clock says:
// without it a browser in Honolulu would print the 19th.
export function launchDay(locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    LAUNCH_AT,
  );
}
