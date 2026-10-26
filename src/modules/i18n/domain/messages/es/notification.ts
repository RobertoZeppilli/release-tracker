import type { MessageDictionary } from "../index";

// The bell and its panel, in Spanish. `featured` and `notable` stay in English: they are the names of
// a Significance, which is the product's own grammar.
export const notification = {
  "notification.title": "notificaciones",
  // What the bell says while the number is still on its way: a name that claims none unseen
  // would be a guess at the one state that has a word of its own (DESIGN.md, Reserved Space).
  "notification.open": "Notificaciones",
  "notification.bell.none": "Notificaciones, ninguna por ver",
  "notification.bell.unseen": {
    one: "Notificaciones, {count} por ver",
    many: "Notificaciones, {count} por ver",
    other: "Notificaciones, {count} por ver",
  },
  "notification.close": "Cerrar las notificaciones",
  "notification.empty":
    "Todavía nada. Una notificación llega cuando una release featured o notable de una Tecnología que sigues tiene su síntesis.",
  "notification.markAll": "marcar todas como vistas",
  "notification.markOne": "Marcar {name} {version} como vista",
  // El mensaje de Slack, que no tiene una página desde la que leerse.
  "notification.slack.heading": {
    one: "{count} release nueva de las Tecnologías que sigues",
    many: "{count} releases nuevas de las Tecnologías que sigues",
    other: "{count} releases nuevas de las Tecnologías que sigues",
  },
  "notification.slack.more": {
    one: "y {count} más",
    many: "y {count} más",
    other: "y {count} más",
  },
  "notification.slack.test": "Mensaje de prueba de verdict. El canal de Slack funciona.",
  "notification.unseen": "por ver",
} as const satisfies Partial<MessageDictionary>;
