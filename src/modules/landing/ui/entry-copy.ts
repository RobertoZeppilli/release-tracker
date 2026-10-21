import type { Session } from "@/modules/auth/ui";
import { DEFAULT_REDIRECT, loginPath } from "@/modules/auth";
import { type Locale, localePath, type Translator } from "@/modules/i18n";

export type Audience = "visitor" | "developer";

// The landing's entry action in its two faces. It never disappears and it never asks for something
// already done: with a session open it names the Dashboard, which is where that reader's work is
// (DESIGN.md, The No Dead End Rule). `next` is the Dashboard on the visitor's face too, because
// someone signing in from here is asking for the thing sign-in gets them.
// A function and not a constant since ADR 0008: the two addresses carry the language of the page
// they are read on, and `next` has to be the Dashboard **in that language**, or signing in from the
// Italian landing would land on the English Dashboard.
export function entryFaces(locale: Locale, t: Translator): Record<Audience, { href: string; label: string }> {
  return {
    visitor: {
      href: loginPath(localePath(locale, DEFAULT_REDIRECT), locale),
      label: t("landing.entry.visitor"),
    },
    developer: { href: localePath(locale, DEFAULT_REDIRECT), label: t("landing.entry.developer") },
  };
}

export const AUDIENCES = ["visitor", "developer"] as const satisfies readonly Audience[];

// A session that has not landed yet is served the visitor's face, and this is the one place where
// an unknown is answered with a guess instead of being declared: the face is in the prerendered
// document, read by every crawler and by the commonest reader of the page, and the alternative is
// an empty box over the fold for as long as the cookie takes to be read. What the rule asks for is
// kept where it matters, the space (DESIGN.md, The Reserved Space Rule): both labels occupy the
// same cell, so the box is as wide as the wider of them from the first paint and the change of face
// moves nothing.
export function audienceFor(state: Session["state"]): Audience {
  return state === "developer" ? "developer" : "visitor";
}
