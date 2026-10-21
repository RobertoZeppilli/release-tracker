import type { MessageDictionary } from "../index";

// The Summary as the page frames it, in French. The Summary itself is not here: its title, its key
// points and its breaking changes are written by the model in English and stay in it (ADR 0008),
// which is why the page says out loud that it is mixed. `breaking changes` stays English in every
// language, because it is the product's grammar and the reader sees it inside the Summary itself.
export const summary = {
  "summary.verdict.action": "action requise",
  "summary.verdict.safe": "mise à jour sûre",
  "summary.verdict.unjudged": "notes non jugeables",
  "summary.unjudged.why":
    "Ces notes de version renvoient ailleurs au lieu de décrire ce qui a changé, donc aucun des deux verdicts ne serait honnête : nous n’avons trouvé aucun breaking change, ce qui n’est pas la même chose qu’il n’y en ait aucun. Les notes sont ci-dessous, avec le lien vers lequel elles renvoient.",
  "summary.counts.breaking": {
    one: "{count} breaking change",
    many: "{count} breaking changes",
    other: "{count} breaking changes",
  },
  "summary.counts.keyPoints": {
    one: "{count} point clé",
    many: "{count} points clés",
    other: "{count} points clés",
  },
  "summary.section.breaking": "breaking changes",
  "summary.section.keyPoints": "points clés",
  "summary.section.allCited": "tous cités, chacun avec un correctif",
  "summary.section.eachFixed": "chacun avec un correctif",
  "summary.provenance":
    "synthèse · uniquement d’après les notes de version · {model} · prompt {version}",
} as const satisfies Partial<MessageDictionary>;
