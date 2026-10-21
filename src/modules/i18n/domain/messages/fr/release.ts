import type { MessageDictionary } from "../index";

// A Release as the product talks about it, in French. The states of a Summary are named with the
// glossary's own words, and the prefixes and the Significance names are not here at all: they are
// the product's grammar (ADR 0008). `breaking changes` stays English, which is what the reader sees
// two lines below inside the Summary itself.
export const release = {
  // Said in the language of the sentence: a reader of French is told `en anglais`.
  "release.originalLanguage": "la synthèse et les notes de version sont en anglais",
  "release.notes": "Notes de version",
  "release.viewOn": "Voir sur {where}",
  "release.viewOnLower": "voir sur {where}",
  "release.via": "via {source}",
  "release.digestCount": {
    one: "{count} release digest",
    many: "{count} releases digest",
    other: "{count} releases digest",
  },
  "release.breakingIn": "Breaking changes dans {label}",
  "release.readNotes": "lire les notes de version",
  "release.migrate": "migrer vers {name} {version}",
  "release.none": "Aucune release enregistrée pour le moment.",
  "release.verdict.action": "action requise",
  "release.verdict.actionCount": {
    one: "action requise · {count} breaking change",
    many: "action requise · {count} breaking changes",
    other: "action requise · {count} breaking changes",
  },
  "release.verdict.safe": "mise à jour sûre",
  "release.verdict.unjudged": "notes non jugeables",
  "release.status.queued": "synthèse en file",
  "release.status.processing": "synthèse en cours",
  "release.status.unavailable": "aucune note de version à synthétiser",
  "release.status.digest": "pas de synthèse pour cette release digest",
  "release.status.older": "pas de synthèse pour cette release plus ancienne",
  "release.status.failed": "synthèse indisponible",
  "release.status.none": "aucune synthèse",
  "release.status.label": "État de la synthèse",
  // Dates are absolute because the page is cached: `aujourd’hui` would go stale in it.
  "release.status.detected": "Détectée {when}.",
  "release.status.imported": "Importée {when}.",
  "release.status.when": "le {date} à {time} UTC",
  "release.status.queuedBody":
    "{recorded} Les synthèses arrivent d’habitude en quelques heures ; les notes de version complètes sont déjà ci-dessous.",
  "release.status.unavailableBody":
    "Les mainteneurs ont publié cette version sans notes de version, et nous ne devinons pas ce qui a changé.",
  "release.status.unavailableGitHub":
    "L’historique des commits sur GitHub est la meilleure source.",
  "release.status.digestBody":
    "Les releases digest sont listées sans synthèse. Les notes de version originales de cette version sont ci-dessous.",
  "release.status.olderBody":
    "Nous synthétisons les releases récentes. Les notes de version originales de cette version sont ci-dessous.",
  "release.status.failedBody":
    "Nous n’avons pas pu produire de synthèse fiable pour cette release. Les notes de version originales sont ci-dessous.",
  "release.source.lines": {
    one: "{count} ligne",
    many: "{count} lignes",
    other: "{count} lignes",
  },
  "release.source.back": "retour à {label}",
} as const satisfies Partial<MessageDictionary>;
