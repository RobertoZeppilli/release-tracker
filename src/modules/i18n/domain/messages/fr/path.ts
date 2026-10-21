import type { MessageDictionary } from "../index";

// The Upgrade Path, in French: `chemin de mise à jour`, the name chosen for it in this language.
// `featured`, `notable`, `digest` and `major` stay as they are: the first three are the product's
// grammar (ADR 0008) and `major` is the word the reader already uses for a version.
export const path = {
  "path.title": "chemin de mise à jour",
  "path.latest": "dernière",
  // The visible word has to sit inside the accessible name, as WCAG 2.5.3 asks: `depuis` is inside
  // `Mettre à jour depuis`.
  "path.from": "depuis",
  "path.from.name": "Mettre à jour depuis",
  "path.check": "Vérifier",
  "path.whatToDo": "Quoi faire",
  "path.changed.inOrder": "ce qui a changé, dans l’ordre où vous mettez à jour",
  "path.changed.newest": "ce qui a changé, de la major la plus récente",
  "path.previews.ahead": "au-delà de {version}",
  "path.previews.upcoming": "à venir",
  "path.legend.label": "Remplissage des barres",
  "path.legend.action": "demande une action",
  // ⚠️ The same 26 characters the Dashboard verdict has, for the same reason: this is the other
  // Column verdict (DESIGN.md). The clause inside the sentence below keeps the verb.
  "path.verdict.action": {
    one: "{count} action",
    many: "{count} actions",
    other: "{count} actions",
  },
  "path.verdict.missing": "{count} sans verdict",
  "path.verdict.upToDate": "tout est à jour",
  "path.safe": "mise à jour sûre",
  "path.sentence.latest": "{from} est déjà la dernière release stable.",
  "path.sentence.all": "Entre {from} et {to} {total} : {list}.",
  "path.sentence.total": {
    one: "il y a {count} release",
    many: "il y a {count} releases",
    other: "il y a {count} releases",
  },
  "path.list.last": "{items} et {last}",
  "path.clause.action": {
    one: "{count} demande une action",
    many: "{count} demandent une action",
    other: "{count} demandent une action",
  },
  "path.clause.safe": {
    one: "{count} est une mise à jour sûre",
    many: "{count} sont des mises à jour sûres",
    other: "{count} sont des mises à jour sûres",
  },
  "path.clause.noSummary": {
    one: "{count} n’a pas encore de synthèse (voyez ses notes)",
    many: "{count} n’ont pas encore de synthèse (voyez leurs notes)",
    other: "{count} n’ont pas encore de synthèse (voyez leurs notes)",
  },
  "path.clause.unjudged": {
    one: "{count} a des notes trop maigres pour juger",
    many: "{count} ont des notes trop maigres pour juger",
    other: "{count} ont des notes trop maigres pour juger",
  },
  "path.clause.digest": {
    one: "{count} est un correctif digest que vous pouvez passer",
    many: "{count} sont des correctifs digest que vous pouvez passer",
    other: "{count} sont des correctifs digest que vous pouvez passer",
  },
  // The rows of the panel. The figure is printed in a column of its own, so none of these carries
  // `{count}`: the count is passed all the same, because it is what chooses the plural form.
  "path.row.total": {
    one: "release, de {from} à {to}",
    many: "releases, de {from} à {to}",
    other: "releases, de {from} à {to}",
  },
  "path.row.action": {
    one: "demande une action",
    many: "demandent une action",
    other: "demandent une action",
  },
  "path.row.noSummary": "pas encore de synthèse",
  "path.row.unjudged": "notes trop maigres pour juger",
  "path.row.digest": {
    one: "correctif digest que vous pouvez passer",
    many: "correctifs digest que vous pouvez passer",
    other: "correctifs digest que vous pouvez passer",
  },
  "path.showAll": {
    one: "montrer la seule release ({count})",
    many: "montrer les {count} releases",
    other: "montrer les {count} releases",
  },
  "path.history.nothing": "rien d’enregistré pour le moment.",
  "path.history.all": "tout l’historique enregistré, {releases} dans {majors}.",
  "path.history.allAndPreviews":
    "tout l’historique enregistré, {releases} dans {majors}, et {previews}.",
  "path.history.previewsOnly": "tout l’historique enregistré, {previews}.",
  "path.history.label": "Historique enregistré",
  "path.history.back": "retour au chemin de mise à jour",
  "path.count.releases": {
    one: "{count} release",
    many: "{count} releases",
    other: "{count} releases",
  },
  "path.count.majors": {
    one: "{count} major",
    many: "{count} majors",
    other: "{count} majors",
  },
  "path.count.previews": {
    one: "{count} preview à venir",
    many: "{count} previews à venir",
    other: "{count} previews à venir",
  },
  // The stat row beside a bar. `missing` holds two different facts and neither may be printed as
  // the other: a Release with no Summary is not summarized, one whose notes could not be judged is
  // there to be checked.
  "path.kind.featured": "{count} featured",
  "path.kind.notable": "{count} notable",
  "path.kind.digest": "{count} digest",
  "path.missing.notSummarized": "{count} non synthétisées",
  "path.missing.toCheck": "{count} à vérifier",
  "path.after": "après {version}",
  "path.start.note":
    "départ depuis {version}, {which}, parce qu’aucune version n’a été donnée.",
  "path.start.previousMajor": "la dernière release de la major précédente",
  "path.start.oldest": "la plus ancienne release enregistrée",
  // What the form answers with. `major.minor.patch` is the shape of a Version, not a word.
  "path.invalid.malformed":
    "{from} n’est pas une version. Écrivez-la comme major.minor.patch, par exemple {example}.",
  "path.invalid.empty": "Une valeur vide",
  "path.invalid.notOlder":
    "{from} est plus récente que {latest}, la dernière release stable.",
  "path.invalid.noStable":
    "Il n’y a pas encore de release stable, donc il n’y a pas de chemin de mise à jour.",
  "path.unrecorded.why":
    "{from} n’est pas une release {name} enregistrée, donc le chemin compte les releases enregistrées après elle.",
  // Split from the links that follow it, because a message cannot carry an element (`message.ts`).
  "path.unrecorded.ask": "Vouliez-vous dire",
  "path.or": "ou",
} as const satisfies Partial<MessageDictionary>;
