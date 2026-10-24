import type { MessageDictionary } from "../index";

// The Upgrade Path, in Italian: `cammino di upgrade`, which is the glossary's own name for it
// (GLOSSARY.md). `featured`, `notable`, `digest` and `major` stay as they are: the first three are
// the product's grammar (ADR 0008) and `major` is the word the reader already uses for a version.
// `aggiornamento sicuro` is the Italian of `safe to upgrade`, decided with the user on 2026-10-16.
export const path = {
  "path.title": "cammino di upgrade",
  "path.latest": "ultima",
  // The visible word has to sit inside the accessible name, as WCAG 2.5.3 asks: `da` is inside
  // `Upgrade da`.
  "path.from": "da",
  "path.from.name": "Upgrade da",
  "path.check": "Verifica",
  "path.whatToDo": "Cosa fare",
  "path.changed.inOrder": "cosa è cambiato, nell'ordine in cui aggiorni",
  "path.changed.newest": "cosa è cambiato, dalla major più recente",
  "path.previews.ahead": "oltre la {version}",
  "path.previews.upcoming": "in arrivo",
  "path.legend.label": "Riempimento delle barre",
  "path.legend.action": "richiede un intervento",
  // The same 26 characters the Dashboard verdict has, for the same reason: this is the other
  // Column verdict (DESIGN.md). The clause inside the sentence below keeps the verb.
  "path.verdict.action": {
    one: "{count} intervento",
    many: "{count} interventi",
    other: "{count} interventi",
  },
  "path.verdict.missing": "{count} senza un verdetto",
  "path.verdict.upToDate": "tutto aggiornato",
  "path.safe": "aggiornamento sicuro",
  "path.sentence.latest": "{from} è già l'ultima release stabile.",
  "path.sentence.all": "Tra {from} e {to} {total}: {list}.",
  "path.sentence.total": {
    one: "c'è {count} release",
    many: "ci sono {count} release",
    other: "ci sono {count} release",
  },
  "path.list.last": "{items} e {last}",
  "path.clause.action": {
    one: "{count} richiede un intervento",
    many: "{count} richiedono un intervento",
    other: "{count} richiedono un intervento",
  },
  "path.clause.safe": {
    one: "{count} è un aggiornamento sicuro",
    many: "{count} sono aggiornamenti sicuri",
    other: "{count} sono aggiornamenti sicuri",
  },
  "path.clause.noSummary": {
    one: "{count} non ha ancora una sintesi (controlla le sue note)",
    many: "{count} non hanno ancora una sintesi (controlla le loro note)",
    other: "{count} non hanno ancora una sintesi (controlla le loro note)",
  },
  "path.clause.unjudged": {
    one: "{count} ha note troppo scarne per giudicare",
    many: "{count} hanno note troppo scarne per giudicare",
    other: "{count} hanno note troppo scarne per giudicare",
  },
  "path.clause.digest": {
    one: "{count} è una correzione digest che puoi saltare",
    many: "{count} sono correzioni digest che puoi saltare",
    other: "{count} sono correzioni digest che puoi saltare",
  },
  "path.row.total": {
    one: "release, dalla {from} alla {to}",
    many: "release, dalla {from} alla {to}",
    other: "release, dalla {from} alla {to}",
  },
  "path.row.action": {
    one: "richiede un intervento",
    many: "richiedono un intervento",
    other: "richiedono un intervento",
  },
  "path.row.noSummary": "ancora senza sintesi",
  "path.row.unjudged": "note troppo scarne per giudicare",
  "path.row.digest": {
    one: "correzione digest che puoi saltare",
    many: "correzioni digest che puoi saltare",
    other: "correzioni digest che puoi saltare",
  },
  "path.showAll": {
    one: "mostra {count} release",
    many: "mostra tutte le {count} release",
    other: "mostra tutte le {count} release",
  },
  "path.history.nothing": "ancora niente registrato.",
  "path.history.all": "tutto lo storico registrato, {releases} in {majors}.",
  "path.history.allAndPreviews":
    "tutto lo storico registrato, {releases} in {majors}, e {previews}.",
  "path.history.previewsOnly": "tutto lo storico registrato, {previews}.",
  "path.history.label": "Storico registrato",
  "path.history.back": "torna al cammino di upgrade",
  "path.count.releases": {
    one: "{count} release",
    many: "{count} release",
    other: "{count} release",
  },
  "path.count.majors": {
    one: "{count} major",
    many: "{count} major",
    other: "{count} major",
  },
  "path.count.previews": {
    one: "{count} anteprima in arrivo",
    many: "{count} anteprime in arrivo",
    other: "{count} anteprime in arrivo",
  },
  "path.kind.featured": "{count} featured",
  "path.kind.notable": "{count} notable",
  "path.kind.digest": "{count} digest",
  // `senza sintesi` and not `non sintetizzate`: the figure is printed before it whatever the count
  // is, and the Italian participle would have to agree with a number this message cannot see.
  "path.missing.notSummarized": "{count} senza sintesi",
  "path.missing.toCheck": "{count} da controllare",
  "path.after": "dopo la {version}",
  "path.start.note":
    "si parte dalla {version}, {which}, perché non è stata data nessuna versione.",
  "path.start.previousMajor": "l'ultima release della major precedente",
  "path.start.oldest": "la release più vecchia registrata",
  "path.invalid.malformed":
    "{from} non è una versione. Scrivila come major.minor.patch, per esempio {example}.",
  // Read as the subject of the sentence above: `Un valore vuoto non è una versione.`
  "path.invalid.empty": "Un valore vuoto",
  "path.invalid.notOlder": "{from} è più recente della {latest}, l'ultima release stabile.",
  "path.invalid.noStable":
    "Non c'è ancora nessuna release stabile, quindi non c'è nessun cammino di upgrade.",
  "path.unrecorded.why":
    "{from} non è una release di {name} registrata, quindi il cammino conta le release registrate dopo di essa.",
  "path.unrecorded.ask": "Intendevi",
  "path.or": "o",
} as const satisfies Partial<MessageDictionary>;
