import type { MessageDictionary } from "../index";

// The bell and its panel, in Italian. `featured` and `notable` stay in English: they are the names
// of a Significance, which is the product's own grammar. `Visto` is the name of the state in the
// glossary, so the sentences say it with that word and not with a synonym.
export const notification = {
  "notification.title": "notifiche",
  // What the bell says while the number is still on its way: a name that claims none unseen
  // would be a guess at the one state that has a word of its own (DESIGN.md, Reserved Space).
  "notification.open": "Notifiche",
  "notification.bell.none": "Notifiche, nessuna da vedere",
  "notification.bell.unseen": {
    one: "Notifiche, {count} da vedere",
    many: "Notifiche, {count} da vedere",
    other: "Notifiche, {count} da vedere",
  },
  "notification.close": "Chiudi le notifiche",
  "notification.empty":
    "Ancora niente. Una Notifica arriva quando una Release featured o notable di una Tecnologia che segui ha la sua Sintesi.",
  "notification.markAll": "segna tutte come viste",
  "notification.markOne": "Segna {name} {version} come vista",
  "notification.unseen": "da vedere",
} as const satisfies Partial<MessageDictionary>;
