import type { MessageDictionary } from "../index";

// A Release as the product talks about it, in Italian. The states of a Summary are named with the
// glossary's own words (`In attesa`, `In corso`, `Non disponibile`, GLOSSARY.md), and the prefixes
// and the Significance names are not here at all: they are the product's grammar (ADR 0008).
// `breaking changes` stays English, which is what GLOSSARY.md's own Italian prose does and what the
// reader sees two lines below inside the Summary (decided with the user on 2026-10-16).
export const release = {
  // Said in the language of the sentence: a reader of Italian is told `in inglese`.
  "release.originalLanguage": "la sintesi e le note di rilascio sono in inglese",
  "release.notes": "Note di rilascio",
  "release.viewOn": "Vedi su {where}",
  "release.viewOnLower": "vedi su {where}",
  "release.via": "via {source}",
  "release.digestCount": {
    one: "{count} release digest",
    many: "{count} release digest",
    other: "{count} release digest",
  },
  "release.breakingIn": "Breaking changes in {label}",
  "release.readNotes": "leggi le note di rilascio",
  "release.migrate": "migra a {name} {version}",
  "release.none": "Ancora nessuna release registrata.",
  "release.verdict.action": "intervento richiesto",
  "release.verdict.actionCount": {
    one: "intervento richiesto · {count} breaking change",
    many: "intervento richiesto · {count} breaking changes",
    other: "intervento richiesto · {count} breaking changes",
  },
  "release.verdict.safe": "aggiornamento sicuro",
  // `Note giudicabili` is the glossary's own name for what these notes are not (GLOSSARY.md), and it
  // is also what fits: at Verdict scale the container holds about 37 characters and
  // `note: note non sufficienti per giudicare` is 40.
  "release.verdict.unjudged": "note non giudicabili",
  "release.status.queued": "sintesi in attesa",
  "release.status.processing": "sintesi in corso",
  "release.status.unavailable": "nessuna nota di rilascio da sintetizzare",
  "release.status.digest": "nessuna sintesi per questa release digest",
  "release.status.older": "nessuna sintesi per questa release più vecchia",
  "release.status.failed": "sintesi non disponibile",
  "release.status.none": "nessuna sintesi",
  "release.status.label": "Stato della sintesi",
  "release.status.detected": "Rilevata {when}.",
  "release.status.imported": "Importata {when}.",
  "release.status.when": "il {date} alle {time} UTC",
  "release.status.queuedBody":
    "{recorded} Le sintesi arrivano di solito entro qualche ora; le note di rilascio complete sono già qui sotto.",
  "release.status.unavailableBody":
    "I manutentori hanno pubblicato questa versione senza note di rilascio, e noi non indoviniamo cosa è cambiato.",
  "release.status.unavailableGitHub":
    "La cronologia dei commit su GitHub è la fonte migliore.",
  "release.status.digestBody":
    "Le release digest sono elencate senza una sintesi. Le note di rilascio originali di questa versione sono qui sotto.",
  "release.status.olderBody":
    "Sintetizziamo le release recenti. Le note di rilascio originali di questa versione sono qui sotto.",
  "release.status.failedBody":
    "Non siamo riusciti a produrre una sintesi affidabile per questa release. Le note di rilascio originali sono qui sotto.",
  "release.source.lines": {
    one: "{count} riga",
    many: "{count} righe",
    other: "{count} righe",
  },
  "release.source.back": "torna a {label}",
} as const satisfies Partial<MessageDictionary>;
