import type { MessageDictionary } from "../index";

// The bell and its panel, in French. `featured` and `notable` stay in English: they are the names of
// a Significance, which is the product's own grammar.
export const notification = {
  "notification.title": "notifications",
  // What the bell says while the number is still on its way: a name that claims none unseen
  // would be a guess at the one state that has a word of its own (DESIGN.md, Reserved Space).
  "notification.open": "Notifications",
  "notification.bell.none": "Notifications, aucune à voir",
  "notification.bell.unseen": {
    one: "Notifications, {count} à voir",
    many: "Notifications, {count} à voir",
    other: "Notifications, {count} à voir",
  },
  "notification.close": "Fermer les notifications",
  "notification.empty":
    "Rien pour l'instant. Une notification arrive quand une release featured ou notable d'une Technologie que vous suivez a sa synthèse.",
  "notification.markAll": "tout marquer comme vu",
  "notification.markOne": "Marquer {name} {version} comme vu",
  // Le message Slack, qui n'a pas de page d'où être lu.
  "notification.slack.heading": {
    one: "{count} nouvelle release des Technologies que vous suivez",
    many: "{count} nouvelles releases des Technologies que vous suivez",
    other: "{count} nouvelles releases des Technologies que vous suivez",
  },
  "notification.slack.more": {
    one: "et {count} de plus",
    many: "et {count} de plus",
    other: "et {count} de plus",
  },
  "notification.slack.test": "Message de test de verdict. Le canal Slack fonctionne.",
  "notification.unseen": "à voir",
} as const satisfies Partial<MessageDictionary>;
