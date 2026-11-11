import { notFound } from "next/navigation";
import { STATIC_NOT_FOUND_SEGMENT, STATIC_SITE } from "@/lib/static-site";
import NotFound from "../not-found";

// An address that matches nothing still has a language. Without this route, an unmatched path would
// fall out of `app/[locale]` entirely and Next would answer with its own bare 404: no shell, no
// theme, no foot, and `html lang` on whatever the default is. The alternative was
// `global-not-found.tsx`, which is a second root to keep in step with this one (its own fonts, its
// own theme script, its own foot), and a foot that is pasted twice is a foot that drifts.
//
// ⚠️ On the showcase nothing matches an address at request time, because there is nothing running:
// what answers an unknown address is the one document the host serves for every miss, `404.html`.
// So the route writes that document, at this reserved address, and `build-static.mts` moves it into
// place (issue #215).
// ⚠️ In every language, although a static host serves one 404 for the whole site and the English one
// is the one it keeps: `output: "export"` refuses a route that returns no parameters at all, and
// the parameters of a route under `[locale]` are produced once per language. The four it does not
// serve are deleted by the same script that puts the fifth in place.
export function generateStaticParams(): { rest: string[] }[] {
  return STATIC_SITE ? [{ rest: [STATIC_NOT_FOUND_SEGMENT] }] : [];
}

// `notFound()` is a thing a server does. The showcase renders the same page instead, which is what
// `notFound()` would have reached anyway: the one under `app/[locale]`, with the shell around it.
export default async function UnmatchedPath() {
  if (STATIC_SITE) return <NotFound />;
  notFound();
}
