import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Einstellungen",
  "settings.intro":
    "Wie sich die App für dich liest. Nichts davon wird mit jemandem geteilt, und nichts auf den öffentlichen Release- und Technologieseiten hängt davon ab.",
  "settings.language.note":
    "Die Sprache ist Teil der Adresse, also lässt sich eine Seite in der Sprache teilen, in der sie gelesen wurde. Release Notes und Zusammenfassungen bleiben in ihrer Originalsprache.",
  // Der Abschnitt der Benachrichtigungen (Issue #171, ADR 0009). `featured`, `notable`, `digest` und
  // `Pro` sind die Grammatik des Produkts und bleiben englisch; die Namen des Glossars werden in den
  // Sätzen übersetzt (ADR 0008).
  "settings.notifications.title": "benachrichtigungen",
  "settings.notifications.intro":
    "Welche Releases dich erreichen, und wo. Die Glocke ist für immer gratis; Slack und E-Mail sind Pro.",
  "settings.notifications.featured.label": "featured Releases",
  "settings.notifications.featured.off":
    "Ausgeschaltet schreibt ein featured Release einer Technologie, der du folgst, keine Benachrichtigung: nichts an der Glocke, und nichts auf einem später ergänzten Kanal.",
  "settings.notifications.notable.label": "notable Releases",
  "settings.notifications.notable.off":
    "Ausgeschaltet schreibt ein notable Release keine Benachrichtigung. Die featured haben einen eigenen Schalter, damit die Releases, für die eine Unterbrechung lohnt, an bleiben, während diese schweigen.",
  "settings.notifications.switch": "{name} an der Glocke",
  "settings.notifications.error":
    "Nicht gespeichert. Der Schalter steht wieder so, wie die Datenbank ihn hält, also ist das Gezeigte das Vorhandene: drücke ihn noch einmal.",
  "settings.notifications.digest":
    "Der wöchentliche Digest bringt seinen eigenen Schalter mit, an dem Tag, an dem der Digest selbst kommt.",
  "settings.notifications.external.title": "slack und e-mail",
  "settings.notifications.external.body":
    "Beide Kanäle werden gebaut, und jeder bringt seinen Schalter mit, sobald er da ist. Sie tragen das Zeichen Pro vom ersten Tag an, Testzeit eingeschlossen: endet die Testzeit ohne Pro, gehen sie aus, und nichts bleibt aus Gewohnheit an. Die Glocke bleibt, gratis.",
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.waiting":
    "Deine Testzeit von {count} Tagen für Slack und E-Mail beginnt, wenn du einen der beiden zum ersten Mal einschaltest, nicht am Tag der Anmeldung.",
  "settings.notifications.trial.left": {
    one: "Es bleibt ein Tag Testzeit für Slack und E-Mail.",
    other: "Es bleiben {count} Tage Testzeit für Slack und E-Mail.",
  },
  "settings.notifications.trial.ended":
    "Deine Testzeit für Slack und E-Mail ist vorbei. Die Glocke ist für immer gratis; die zwei externen Kanäle brauchen Pro.",
  "settings.notifications.locale.title": "sprache von e-mail und slack",
  "settings.notifications.locale.note":
    "E-Mail und Slack haben keine Adresse, aus der sie eine Sprache lesen könnten, also werden sie in dieser geschrieben. Es ändert nicht die Sprache der Seite, die die der Adresse bleibt, und Release Notes und Zusammenfassungen bleiben in ihrer Originalsprache.",
  "settings.notifications.locale.choose": "E-Mail und Slack in {name} schreiben",
  "settings.notifications.locale.error":
    "Nicht gespeichert. Die Sprache ist noch die hier markierte, die die Datenbank hält: drücke sie noch einmal.",
} as const satisfies Partial<MessageDictionary>;
