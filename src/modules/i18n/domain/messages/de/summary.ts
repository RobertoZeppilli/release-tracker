import type { MessageDictionary } from "../index";

// The Summary as the page frames it, in German. The Summary itself is not here: its title, its key
// points and its breaking changes are written by the model in English and stay in it (ADR 0008),
// which is why the page says out loud that it is mixed. `Breaking Changes` stays English in every
// language, because it is the product's grammar and the reader sees it inside the Summary itself;
// German capitalises it, which is what German does to a noun it has borrowed.
export const summary = {
  // ⚠️ Short, like the Italian one: this is the Column verdict and the line holds about 26
  // characters at its scale (DESIGN.md, The One-Line Verdict Rule). `Eingriff nötig` is 14.
  "summary.verdict.action": "Eingriff nötig",
  "summary.verdict.safe": "Upgrade unbedenklich",
  "summary.verdict.unjudged": "Notes nicht beurteilbar",
  "summary.unjudged.why":
    "Diese Release Notes verweisen woandershin, statt zu beschreiben, was sich geändert hat, also wäre keines der beiden Urteile ehrlich: wir haben keine Breaking Changes gefunden, was nicht dasselbe ist wie keine zu haben. Die Notes stehen hier unten, mit dem Link, auf den sie verweisen.",
  "summary.counts.breaking": {
    one: "{count} Breaking Change",
    other: "{count} Breaking Changes",
  },
  "summary.counts.keyPoints": {
    one: "{count} Kernpunkt",
    other: "{count} Kernpunkte",
  },
  "summary.section.breaking": "breaking changes",
  "summary.section.keyPoints": "Kernpunkte",
  "summary.section.allCited": "alle zitiert, jeder mit einer Lösung",
  "summary.section.eachFixed": "jeder mit einer Lösung",
  "summary.provenance":
    "Zusammenfassung · nur aus den Release Notes · {model} · prompt {version}",
} as const satisfies Partial<MessageDictionary>;
