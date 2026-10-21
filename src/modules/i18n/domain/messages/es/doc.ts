import type { MessageDictionary } from "../index";

// What the five document pages share, in Spanish. `FAQ` stays `FAQ`: it is the name the page is
// known by and the name the foot calls it, in Spanish as in English.
export const doc = {
  "doc.updated": "última actualización: {date}",
  // ⚠️ The sentence that says which language holds. Only `terms` and `privacy` print it, because
  // they are the two pages that bind: the other three explain, and an explanation translated badly
  // is a mistake to fix, not a conflict to arbitrate.
  "doc.governing":
    "Esta página se publica en cinco idiomas. Donde no coincidan, es el texto en inglés el que vale.",
  "doc.link.privacy": "política de privacidad",
  "doc.link.account": "página de la cuenta",
  "doc.link.faq": "FAQ",
} as const satisfies Partial<MessageDictionary>;
