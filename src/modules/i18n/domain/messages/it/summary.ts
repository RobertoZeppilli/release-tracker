import type { MessageDictionary } from "../index";

// The Summary as the page frames it, in Italian. The Summary itself is not here: its title, its key
// points and its breaking changes are written by the model in English and stay in it (ADR 0008),
// which is why the page says out loud that it is mixed. `punti chiave` and `breaking changes` were
// decided with the user on 2026-10-16.
export const summary = {
  "summary.verdict.action": "intervento richiesto",
  "summary.verdict.safe": "aggiornamento sicuro",
  "summary.verdict.unjudged": "note non giudicabili",
  "summary.unjudged.why":
    "Queste note di rilascio rimandano altrove invece di descrivere cosa è cambiato, quindi nessuno dei due verdetti sarebbe onesto: non abbiamo trovato breaking changes, che non è la stessa cosa che non ce ne siano. Le note sono qui sotto, con il link a cui rimandano.",
  "summary.counts.breaking": {
    one: "{count} breaking change",
    many: "{count} breaking changes",
    other: "{count} breaking changes",
  },
  "summary.counts.keyPoints": {
    one: "{count} punto chiave",
    many: "{count} punti chiave",
    other: "{count} punti chiave",
  },
  "summary.section.breaking": "breaking changes",
  "summary.section.keyPoints": "punti chiave",
  "summary.section.allCited": "tutte citate, ognuna con una soluzione",
  "summary.section.eachFixed": "ognuna con una soluzione",
  "summary.provenance": "sintesi · solo dalle note di rilascio · {model} · prompt {version}",
} as const satisfies Partial<MessageDictionary>;
