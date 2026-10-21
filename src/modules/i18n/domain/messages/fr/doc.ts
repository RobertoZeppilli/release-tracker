import type { MessageDictionary } from "../index";

// What the five document pages share, in French. `FAQ` stays `FAQ`: it is the name the page is
// known by and the name the foot calls it, in French as in English.
export const doc = {
  // French puts a space before a colon, and it is a narrow no-break space in print; a plain space
  // is what a browser can be trusted to keep on one line here.
  "doc.updated": "dernière mise à jour : {date}",
  // ⚠️ The sentence that says which language holds. Only `terms` and `privacy` print it, because
  // they are the two pages that bind: the other three explain, and an explanation translated badly
  // is a mistake to fix, not a conflict to arbitrate.
  "doc.governing":
    "Cette page est publiée en cinq langues. En cas de divergence, c’est le texte anglais qui fait foi.",
  "doc.link.privacy": "politique de confidentialité",
  "doc.link.account": "page du compte",
  "doc.link.faq": "FAQ",
} as const satisfies Partial<MessageDictionary>;
