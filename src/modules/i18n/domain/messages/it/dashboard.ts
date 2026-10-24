import type { MessageDictionary } from "../index";

// The Dashboard, in Italian. The verdict is said with the glossary's own words: `Intervento
// richiesto` is the name of the judgement (GLOSSARY.md), so a sentence about it reads `richiede un
// intervento`. `digest` stays as it is, here and everywhere: it is the name of a Significance.
export const dashboard = {
  // ⚠️ Short because the Column verdict is: at 1.2rem inside a 326px panel the line holds about 26
  // characters, label included, and `warning: 2 richiedono un intervento` is 35 (DESIGN.md, The
  // One-Line Verdict Rule, which says the copy gives way and the scale never does). So the claim is
  // said with the glossary's own noun, `Intervento richiesto`, instead of with its verb.
  "dashboard.needsAction": {
    one: "{count} intervento",
    many: "{count} interventi",
    other: "{count} interventi",
  },
  "dashboard.verdict.ok": "nessun intervento",
  // ⚠️ Read at 360px: the rule is one line, and the copy is what gives way (DESIGN.md, The One-Line
  // Verdict Rule). This is the short form, like the English one it translates.
  "dashboard.verdict.none": "niente da giudicare",
  "dashboard.standing.noVersion": "nessuna versione dichiarata",
  "dashboard.standing.upToDate": "aggiornata",
  "dashboard.standing.behind": {
    one: "{count} dietro la {declared}",
    many: "{count} dietro la {declared}",
    other: "{count} dietro la {declared}",
  },
  "dashboard.standing.list": "Tecnologie seguite, per distanza",
  "dashboard.totals.empty":
    "nessuna versione dichiarata. dichiarane una su una pagina di tecnologia e i totali arrivano qui.",
  "dashboard.totals.behind": "release di distanza in tutto",
  "dashboard.totals.missing": "senza un verdetto",
  "dashboard.totals.since": "versione dichiarata più vecchia",
  "dashboard.barNote":
    "la barra è la distanza dalla versione che hai dichiarato, non un punteggio",
  "dashboard.quota.followed": "{count} di {limit} seguite",
  "dashboard.quota.swap": "smetti di seguirne una per seguirne un'altra",
  "dashboard.stream.title": "cosa è successo · ultimi {days} giorni",
  "dashboard.stream.count": {
    one: ", {count} release",
    many: ", {count} release",
    other: ", {count} release",
  },
  "dashboard.stream.thisWeek": "questa settimana",
  "dashboard.stream.window": "finestra: ultimi {days} giorni, dal {start} al {end} UTC",
  "dashboard.stream.declaration": "sei sulla {version}",
  "dashboard.stream.migrate": "migra a {name} {version}",
  // The day before the month, which is the order Italian writes a date in: `2 dic`, not `dic 2`.
  "dashboard.week.day": "{day} {month}",
  "dashboard.week.range": "dal {start} al {end}",
  "dashboard.week.number": "settimana {week}",
  "dashboard.digest.span.many": "settimane da {from} a {to}",
  "dashboard.digest.claim": {
    one: "{count} release in più, che non chiede niente",
    many: "{count} release in più, nessuna chiede niente",
    other: "{count} release in più, nessuna chiede niente",
  },
  "dashboard.digest.count": {
    one: "{count} release digest",
    many: "{count} release digest",
    other: "{count} release digest",
  },
  "dashboard.digest.noAction": "nessun intervento necessario",
  "dashboard.empty.none": "non segui ancora nessuna tecnologia",
  "dashboard.empty.some": {
    one: "segui {count} tecnologia",
    many: "segui {count} tecnologie",
    other: "segui {count} tecnologie",
  },
  "dashboard.empty.what":
    "Segui gli strumenti del tuo stack. Questa pagina mostra poi, per ognuno, le release che contano degli ultimi {days} giorni e se aggiornare richiede un intervento. Il piano Free ne segue fino a {limit}.",
  "dashboard.empty.open": "Apri la Dashboard",
  "dashboard.empty.catalog": "nel catalogo ({count})",
  "dashboard.empty.browse": {
    one: "sfoglia {count} tecnologia",
    many: "sfoglia tutte le {count} tecnologie",
    other: "sfoglia tutte le {count} tecnologie",
  },
} as const satisfies Partial<MessageDictionary>;
