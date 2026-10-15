import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { type Locale, isLocale } from "../domain/locales";

// The locale is a root parameter, so any Server Component can read it without being handed it
// (Next 16, `next/root-params`): the alternative was threading `locale` through every component
// down to the footer, which is the prop that gets forgotten in the one place it mattered.
// ⚠️ It cannot be read in Client Components, Server Actions or Route Handlers, which is why the
// picker takes its locale as a prop.
export async function currentLocale(): Promise<Locale> {
  const value = await rootLocale();
  // The same answer the layout gives: a segment that is not a language is a page that does not
  // exist, not a reason to fall back to English and serve two addresses for one page.
  if (value === undefined || !isLocale(value)) notFound();
  return value;
}
