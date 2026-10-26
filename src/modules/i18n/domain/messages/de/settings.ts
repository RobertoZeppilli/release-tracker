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
    "Slack ist da, mit eigenen Schaltern weiter unten; die E-Mail wird noch gebaut und bringt ihre eigenen mit, wenn sie kommt. Sie tragen das Pro-Zeichen vom ersten Tag an, Testphase eingeschlossen: Endet die Testphase ohne Pro, schalten sie sich ab, und nichts bleibt aus Gewohnheit an. Die Glocke bleibt, kostenlos.",
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.waiting":
    "Deine Testzeit von {count} Tagen für Slack und E-Mail beginnt, wenn du einen der beiden zum ersten Mal einschaltest, nicht am Tag der Anmeldung.",
  "settings.notifications.trial.left": {
    one: "Es bleibt ein Tag Testzeit für Slack und E-Mail.",
    other: "Es bleiben {count} Tage Testzeit für Slack und E-Mail.",
  },
  "settings.notifications.trial.ended":
    "Deine Testzeit für Slack und E-Mail ist vorbei. Die Glocke ist für immer gratis; die zwei externen Kanäle brauchen Pro.",
  "settings.notifications.switch.slack": "{name} auf Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.note":
    "Slack braucht einen Incoming Webhook: Lege einen in deinem Workspace an, wähle den Kanal und füge die URL hier ein. Sie ist ein Geheimnis, nach dem Speichern liest du nur noch, wohin sie zeigt, nie die URL selbst.",
  "settings.notifications.slack.label": "URL des Incoming Webhooks",
  "settings.notifications.slack.save": "speichern",
  "settings.notifications.slack.remove": "entfernen",
  "settings.notifications.slack.current": "Sendet an {hint}. Lass das Feld leer und speichere, um ihn zu entfernen.",
  "settings.notifications.slack.none": "Noch kein Webhook, also senden die beiden Schalter unten nichts.",
  "settings.notifications.slack.invalid":
    "Nicht gespeichert. Die URL eines Webhooks beginnt mit https://hooks.slack.com/services/ und kommt aus deinem eigenen Workspace.",
  "settings.notifications.slack.featured.off":
    "Aus, erreichen featured Releases weiterhin die Glocke und nicht mehr Slack.",
  "settings.notifications.slack.notable.off":
    "Aus, erreichen notable Releases Slack nicht mehr. Die featured haben einen eigenen Schalter und können weiter ankommen.",
  "settings.notifications.slack.grouping":
    "Eine Nachricht pro Lauf, mit einer Zeile pro Release: zehn Releases in einem Lauf kommen als eine Nachricht an, nicht als zehn.",
  "settings.notifications.slack.test": "Testnachricht senden",
  "settings.notifications.slack.testOk": "Die Testnachricht ist raus. Der Kanal funktioniert.",
  "settings.notifications.slack.testFailed": "Slack hat sie nicht angenommen: {error}",
  "settings.notifications.slack.testEmpty": "Noch nichts zu testen: Speichere zuerst einen Webhook.",
  "settings.notifications.locale.title": "sprache von e-mail und slack",
  "settings.notifications.locale.note":
    "E-Mail und Slack haben keine Adresse, aus der sie eine Sprache lesen könnten, also werden sie in dieser geschrieben. Es ändert nicht die Sprache der Seite, die die der Adresse bleibt, und Release Notes und Zusammenfassungen bleiben in ihrer Originalsprache.",
  "settings.notifications.locale.choose": "E-Mail und Slack in {name} schreiben",
  "settings.notifications.locale.error":
    "Nicht gespeichert. Die Sprache ist noch die hier markierte, die die Datenbank hält: drücke sie noch einmal.",
} as const satisfies Partial<MessageDictionary>;
