import { notFound } from "next/navigation";

// An address that matches nothing still has a language. Without this route, an unmatched path would
// fall out of `app/[locale]` entirely and Next would answer with its own bare 404: no shell, no
// theme, no foot, and `html lang` on whatever the default is. The alternative was
// `global-not-found.tsx`, which is a second root to keep in step with this one (its own fonts, its
// own theme script, its own foot), and a foot that is pasted twice is a foot that drifts.
export default function UnmatchedPath(): never {
  notFound();
}
