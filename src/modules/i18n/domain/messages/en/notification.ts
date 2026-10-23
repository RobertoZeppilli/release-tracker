// The bell and its panel. The strings are born here and every other language translates this file
// (ADR 0008). `featured` and `notable` stay in English in all five: they are the names of a
// Significance, which is the product's own grammar and not text.
export const notification = {
  "notification.title": "notifications",
  // What the bell says while the number is still on its way: a name that claimed none unseen would
  // be a guess at the one state that has a word of its own (DESIGN.md, The Reserved Space Rule).
  "notification.open": "Notifications",
  // The accessible name of the bell once the number is in, and it has to say **how many**: the
  // figure beside the glyph is read by whoever sees it, so it is said to whoever does not (issue
  // #170). Two keys and not one with a `zero` form, because `Intl.PluralRules` gives English no
  // zero form and the bell would have said "0 unseen" in the state that has a word of its own.
  "notification.bell.none": "Notifications, none unseen",
  "notification.bell.unseen": {
    one: "Notifications, {count} unseen",
    other: "Notifications, {count} unseen",
  },
  "notification.close": "Close notifications",
  "notification.empty":
    "Nothing yet. A notification arrives when a featured or notable release of a technology you follow has its summary in.",
  "notification.markAll": "mark all as seen",
  // Names the row, because a page of identical buttons says nothing about which one is which.
  "notification.markOne": "Mark {name} {version} as seen",
  "notification.unseen": "unseen",
} as const;
