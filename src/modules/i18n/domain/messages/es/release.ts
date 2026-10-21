import type { MessageDictionary } from "../index";

// A Release as the product talks about it, in Spanish. The states of a Summary are named with the
// glossary's own words, and the prefixes and the Significance names are not here at all: they are
// the product's grammar (ADR 0008). `breaking changes` stays English, which is what the reader sees
// two lines below inside the Summary itself.
export const release = {
  // Said in the language of the sentence: a reader of Spanish is told `en inglés`.
  "release.originalLanguage": "la síntesis y las notas de la versión están en inglés",
  "release.notes": "Notas de la versión",
  "release.viewOn": "Ver en {where}",
  "release.viewOnLower": "ver en {where}",
  "release.via": "vía {source}",
  "release.digestCount": {
    one: "{count} release digest",
    many: "{count} releases digest",
    other: "{count} releases digest",
  },
  "release.breakingIn": "Breaking changes en {label}",
  "release.readNotes": "leer las notas de la versión",
  "release.migrate": "migrar a {name} {version}",
  "release.none": "Aún no hay releases registradas.",
  "release.verdict.action": "requiere intervención",
  "release.verdict.actionCount": {
    one: "requiere intervención · {count} breaking change",
    many: "requiere intervención · {count} breaking changes",
    other: "requiere intervención · {count} breaking changes",
  },
  "release.verdict.safe": "actualización segura",
  "release.verdict.unjudged": "notas no juzgables",
  "release.status.queued": "síntesis en cola",
  "release.status.processing": "síntesis en curso",
  "release.status.unavailable": "no hay notas de la versión que sintetizar",
  "release.status.digest": "sin síntesis para esta release digest",
  "release.status.older": "sin síntesis para esta release más antigua",
  "release.status.failed": "síntesis no disponible",
  "release.status.none": "sin síntesis",
  "release.status.label": "Estado de la síntesis",
  // Dates are absolute because the page is cached: `hoy` would go stale in it.
  "release.status.detected": "Detectada {when}.",
  "release.status.imported": "Importada {when}.",
  "release.status.when": "el {date} a las {time} UTC",
  "release.status.queuedBody":
    "{recorded} Las síntesis suelen llegar en unas horas; las notas de la versión completas ya están aquí abajo.",
  "release.status.unavailableBody":
    "Los mantenedores publicaron esta versión sin notas de la versión, y nosotros no adivinamos qué cambió.",
  "release.status.unavailableGitHub":
    "El historial de commits en GitHub es la mejor fuente.",
  "release.status.digestBody":
    "Las releases digest se listan sin síntesis. Las notas de la versión originales de esta versión están aquí abajo.",
  "release.status.olderBody":
    "Sintetizamos las releases recientes. Las notas de la versión originales de esta versión están aquí abajo.",
  "release.status.failedBody":
    "No hemos podido producir una síntesis fiable para esta release. Las notas de la versión originales están aquí abajo.",
  "release.source.lines": {
    one: "{count} línea",
    many: "{count} líneas",
    other: "{count} líneas",
  },
  "release.source.back": "volver a {label}",
} as const satisfies Partial<MessageDictionary>;
