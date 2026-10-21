import type { MessageDictionary } from "../index";

// A Release as the product talks about it, in German. The states of a Summary are named with the
// glossary's own words, and the prefixes and the Significance names are not here at all: they are
// the product's grammar (ADR 0008). `Breaking Changes` stays English, which is what the reader sees
// two lines below inside the Summary itself; German capitalises the borrowed noun.
export const release = {
  // Said in the language of the sentence: a reader of German is told `auf Englisch`.
  "release.originalLanguage":
    "die Zusammenfassung und die Release Notes sind auf Englisch",
  "release.notes": "Release Notes",
  "release.viewOn": "Auf {where} ansehen",
  "release.viewOnLower": "auf {where} ansehen",
  "release.via": "über {source}",
  "release.digestCount": {
    one: "{count} digest-Release",
    other: "{count} digest-Releases",
  },
  "release.breakingIn": "Breaking Changes in {label}",
  "release.readNotes": "die Release Notes lesen",
  "release.migrate": "auf {name} {version} migrieren",
  "release.none": "Noch keine Releases erfasst.",
  // ⚠️ Short, because this verdict is read on a row as well as on the page (DESIGN.md, The
  // One-Line Verdict Rule): `Eingriff nötig` is 14 characters where the line holds about 26.
  "release.verdict.action": "Eingriff nötig",
  "release.verdict.actionCount": {
    one: "Eingriff nötig · {count} Breaking Change",
    other: "Eingriff nötig · {count} Breaking Changes",
  },
  "release.verdict.safe": "Upgrade unbedenklich",
  "release.verdict.unjudged": "Notes nicht beurteilbar",
  "release.status.queued": "Zusammenfassung in der Warteschlange",
  "release.status.processing": "Zusammenfassung läuft",
  "release.status.unavailable": "keine Release Notes zum Zusammenfassen",
  "release.status.digest": "keine Zusammenfassung für dieses digest-Release",
  "release.status.older": "keine Zusammenfassung für dieses ältere Release",
  "release.status.failed": "Zusammenfassung nicht verfügbar",
  "release.status.none": "keine Zusammenfassung",
  "release.status.label": "Stand der Zusammenfassung",
  // Dates are absolute because the page is cached: `heute` would go stale in it.
  "release.status.detected": "Erkannt {when}.",
  "release.status.imported": "Importiert {when}.",
  "release.status.when": "am {date} um {time} UTC",
  "release.status.queuedBody":
    "{recorded} Zusammenfassungen kommen meist innerhalb weniger Stunden; die vollständigen Release Notes stehen schon hier unten.",
  "release.status.unavailableBody":
    "Die Maintainer haben diese Version ohne Release Notes veröffentlicht, und wir raten nicht, was sich geändert hat.",
  "release.status.unavailableGitHub":
    "Die Commit-Historie auf GitHub ist die beste Quelle.",
  "release.status.digestBody":
    "digest-Releases werden ohne Zusammenfassung gelistet. Die originalen Release Notes dieser Version stehen hier unten.",
  "release.status.olderBody":
    "Wir fassen die neueren Releases zusammen. Die originalen Release Notes dieser Version stehen hier unten.",
  "release.status.failedBody":
    "Wir konnten für dieses Release keine verlässliche Zusammenfassung erzeugen. Die originalen Release Notes stehen hier unten.",
  "release.source.lines": {
    one: "{count} Zeile",
    other: "{count} Zeilen",
  },
  "release.source.back": "zurück zu {label}",
} as const satisfies Partial<MessageDictionary>;
