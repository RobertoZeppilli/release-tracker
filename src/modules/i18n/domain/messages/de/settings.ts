import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Einstellungen",
  "settings.intro":
    "Wie sich die App für dich liest. Nichts davon wird mit jemandem geteilt, und nichts auf den öffentlichen Release- und Technologieseiten hängt davon ab.",
  "settings.language.title": "Sprache",
  "settings.language.interface": "sprache der oberfläche",
  "settings.language.note":
    "Die Sprache ist Teil der Adresse, also lässt sich eine Seite in der Sprache teilen, in der sie gelesen wurde. Release Notes und Zusammenfassungen bleiben in ihrer Originalsprache.",
  // Der Abschnitt der Benachrichtigungen (Issue #171, ADR 0009). `featured`, `notable`, `digest` und
  // `Pro` sind die Grammatik des Produkts und bleiben englisch; die Namen des Glossars werden in den
  // Sätzen übersetzt (ADR 0008).
  "settings.notifications.title": "Benachrichtigungen",
  "settings.notifications.intro":
    "Welche Releases dich erreichen, und wo. Die Glocke ist für immer gratis; Slack ist Pro.",
  "settings.notifications.bell.title": "die glocke",
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
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.start": "die 30 Tage Pro-Testzeit starten",
  "settings.notifications.trial.note": "30 Tage, gratis. Danach braucht Slack Pro; die Glocke bleibt gratis.",
  "settings.notifications.trial.left": {
    one: "Es bleibt ein Tag Pro-Testzeit.",
    other: "Es bleiben {count} Tage Pro-Testzeit.",
  },
  "settings.notifications.trial.ended": "Die Pro-Testzeit ist vorbei. Slack braucht Pro; die Glocke bleibt gratis.",
  "settings.notifications.switch.slack": "{name} auf Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.connect": "Add to Slack",
  "settings.notifications.slack.dialog.title": "Verdict zu Slack hinzufügen",
  "settings.notifications.slack.dialog.asks": "Slack fragt nach einem Workspace und einem Kanal.",
  "settings.notifications.slack.dialog.continue": "weiter zu Slack",
  "settings.notifications.slack.dialog.cancel": "abbrechen",
  "settings.notifications.slack.result.connected": "Slack ist verbunden.",
  "settings.notifications.slack.result.cancelled": "Nichts hat sich geändert: die Erlaubnis wurde nicht gegeben.",
  "settings.notifications.slack.result.failed":
    "Slack hat die Autorisierung nicht abgeschlossen, es wurde also nichts gespeichert. Versuche es erneut.",
  "settings.notifications.slack.result.denied":
    "Diese Rückkehr gehört zu keiner hier begonnenen Autorisierung und wurde deshalb abgewiesen. Fange auf dieser Seite neu an.",
  "settings.notifications.slack.result.unavailable":
    "Add to Slack ist hier nicht verfügbar, füge also unten einen Webhook ein.",
  "settings.notifications.slack.manual": "oder füge selbst einen Webhook ein",
  "settings.notifications.slack.manualNote":
    "Der andere Weg, und in der Entwicklung der einzige: lege einen Incoming Webhook in deinem Workspace an, wähle den Kanal und füge die URL ein. Sie ist ein Geheimnis, nach dem Speichern liest du nur noch, wohin sie zeigt, nie die URL selbst.",
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
  "settings.notifications.locale.title": "sprache von slack",
  "settings.notifications.locale.note":
    "Slack hat keine Adresse, aus der es eine Sprache lesen könnte, also wird es in dieser geschrieben. Es ändert nicht die Sprache der Seite, die die der Adresse bleibt, und Release Notes und Zusammenfassungen bleiben in ihrer Originalsprache.",
  "settings.notifications.locale.choose": "Slack in {name} schreiben",
  "settings.notifications.locale.error":
    "Nicht gespeichert. Die Sprache ist noch die hier markierte, die die Datenbank hält: drücke sie noch einmal.",
} as const satisfies Partial<MessageDictionary>;
