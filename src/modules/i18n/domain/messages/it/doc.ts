import type { MessageDictionary } from "../index";

// Quello che le cinque pagine documento hanno in comune, in italiano. `FAQ` resta `FAQ`: è il nome
// con cui la pagina è conosciuta e con cui il piede la chiama, in italiano come in inglese.
export const doc = {
  "doc.updated": "ultimo aggiornamento: {date}",
  // ⚠️ La frase che decide quale lingua vale. La stampano solo `terms` e `privacy`, che sono le due
  // pagine che vincolano: le altre tre raccontano, e una traduzione che racconta male è un errore
  // da correggere, non un conflitto da arbitrare.
  "doc.governing":
    "Questa pagina è pubblicata in cinque lingue. Dove non coincidono, è il testo inglese quello che vale.",
  "doc.link.privacy": "informativa sulla privacy",
  "doc.link.account": "pagina dell'account",
  "doc.link.faq": "FAQ",
} as const satisfies Partial<MessageDictionary>;
