import type { MessageDictionary } from "../index";

// What the five document pages share, in German. `FAQ` stays `FAQ`: it is the name the page is
// known by and the name the foot calls it, in German as in English.
export const doc = {
  "doc.updated": "zuletzt aktualisiert: {date}",
  // ⚠️ The sentence that says which language holds. Only `terms` and `privacy` print it, because
  // they are the two pages that bind: the other three explain, and an explanation translated badly
  // is a mistake to fix, not a conflict to arbitrate.
  "doc.governing":
    "Diese Seite erscheint in fünf Sprachen. Wo sie sich unterscheiden, gilt der englische Text.",
  "doc.link.privacy": "Datenschutzerklärung",
  "doc.link.account": "Account-Seite",
  "doc.link.faq": "FAQ",
} as const satisfies Partial<MessageDictionary>;
