import type { MessageDictionary } from "../index";

// The Summary as the page frames it, in Spanish. The Summary itself is not here: its title, its key
// points and its breaking changes are written by the model in English and stay in it (ADR 0008),
// which is why the page says out loud that it is mixed. `breaking changes` stays English in every
// language, because it is the product's grammar and the reader sees it inside the Summary itself.
export const summary = {
  "summary.verdict.action": "requiere intervención",
  "summary.verdict.safe": "actualización segura",
  "summary.verdict.unjudged": "notas no juzgables",
  "summary.unjudged.why":
    "Estas notas de la versión remiten a otro sitio en vez de describir qué cambió, así que ninguno de los dos verdictos sería honesto: no hemos encontrado breaking changes, que no es lo mismo que no haberlos. Las notas están aquí abajo, con el enlace al que remiten.",
  "summary.counts.breaking": {
    one: "{count} breaking change",
    many: "{count} breaking changes",
    other: "{count} breaking changes",
  },
  "summary.counts.keyPoints": {
    one: "{count} punto clave",
    many: "{count} puntos clave",
    other: "{count} puntos clave",
  },
  "summary.section.breaking": "breaking changes",
  "summary.section.keyPoints": "puntos clave",
  "summary.section.allCited": "todos citados, cada uno con su solución",
  "summary.section.eachFixed": "cada uno con su solución",
  "summary.provenance":
    "síntesis · solo a partir de las notas de la versión · {model} · prompt {version}",
} as const satisfies Partial<MessageDictionary>;
