import type { MessageDictionary } from "../index";

// The bell and its panel, in German. `featured` and `notable` stay in English: they are the names of
// a Significance, which is the product's own grammar. `verfolgt` and not `gefolgt`, as the glossary
// has it: `folgen` forms no attributive participle (CONTEXT.md).
export const notification = {
  "notification.title": "benachrichtigungen",
  // What the bell says while the number is still on its way: a name that claims none unseen
  // would be a guess at the one state that has a word of its own (DESIGN.md, Reserved Space).
  "notification.open": "Benachrichtigungen",
  "notification.bell.none": "Benachrichtigungen, keine ungesehen",
  "notification.bell.unseen": {
    one: "Benachrichtigungen, {count} ungesehen",
    other: "Benachrichtigungen, {count} ungesehen",
  },
  "notification.close": "Benachrichtigungen schließen",
  "notification.empty":
    "Noch nichts. Eine Benachrichtigung kommt, wenn ein featured oder notable Release einer von dir verfolgten Technologie seine Zusammenfassung hat.",
  "notification.markAll": "alle als gesehen markieren",
  "notification.markOne": "{name} {version} als gesehen markieren",
  "notification.unseen": "ungesehen",
} as const satisfies Partial<MessageDictionary>;
