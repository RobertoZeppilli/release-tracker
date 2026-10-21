import type { MessageDictionary } from "../index";

// The landing, in German: the argument, the four stages of the demonstration, the two thin
// specimens, the four Significance words defined, and the close.
// What is **not** here is the product's grammar: `verdict:`, `warning:`, `help:`, `breaking[n]:`,
// `note:`, `release-notes:n` and the four Significance names are identical in every language
// (ADR 0008). The figures are not here either: they come from `SPECIMEN`, from the Catalog
// directory and from the Plan, so the sentences name them as gaps.
export const landing = {
  "landing.claim": "Verstehen vor dem Upgrade.",
  // `{breaking}` is the counted phrase below, put in a `strong`, and `{propTypes}` is a `code`:
  // both are gaps a node goes in (`Filled`), so a language is free to move them.
  "landing.lede":
    "{name} {version} kam mit {breaking} über {lines} Zeilen Release Notes. Einer davon lässt {propTypes} nichts mehr tun, lautlos, und er steht in Zeile {line}.",
  "landing.promise":
    "Verdict verfolgt die Releases der Technologien in deinem Stack und gibt jeder ein einziges Urteil: ob sie etwas von dir verlangt, was bricht und wie man migriert. Jede Aussage zeigt auf die Zeile der Release Notes, aus der sie gelesen wurde, damit du sie mit einem Klick prüfen kannst, statt ihr zu glauben.",
  "landing.seeVerdict": "das Urteil zu {name} {version} ansehen",
  // The one counted phrase of the page, read in three places: the lede, the source stage and the
  // help stage. One key, so one language cannot say it three ways.
  "landing.breakingChanges": {
    one: "{count} Breaking Change",
    other: "{count} Breaking Changes",
  },

  // Proof Panel.
  "landing.panel.window": "Zeilen {first} bis {last} von {total}",
  "landing.panel.linesRead": "gelesene Zeilen",

  // The Bench, four stages in reading order. The stage names (`source`, `cite`, `verdict`, `help`)
  // are not here on purpose: each one is also the `id` the page is anchored by.
  "landing.bench.title": "Ein Release, vier Stufen",
  "landing.bench.sub":
    "Dasselbe Release, das der erste Bildschirm zitiert, gelesen, wie die App es liest: was das Projekt veröffentlicht hat, die Zeile, auf der das Urteil ruht, das Urteil selbst, und wohin es weitergeht.",
  "landing.bench.notesFrom": "Notes von {source}, {lines} Zeilen",
  "landing.bench.window": "Zeilen {first} bis {last}",
  "landing.bench.source":
    "{lines} Zeilen, genau so gehalten, wie sie veröffentlicht wurden, und numeriert, damit eine Aussage eine von ihnen nennen kann. Die {breaking} stehen in einem einzigen Abschnitt, und der erste Bildschirm zeigt {window}.",
  "landing.bench.cite":
    "Nichts wird umschrieben. Das Urteil zitiert diese Zeile, zeigt auf sie zurück, und wäre auf eine Weise falsch, die du sehen könntest, wenn die Zeile etwas anderes sagte.",
  "landing.bench.verdictTitle": "propTypes werden nicht mehr geprüft",
  "landing.bench.verdictBody":
    "Eine Komponente, die {propTypes} deklariert, kompiliert weiter und läuft weiter. Nichts warnt, und nichts wird mehr geprüft.",
  "landing.bench.help":
    "migriere zu TypeScript-Props oder zu einer anderen Lösung für die Typprüfung.",
  "landing.bench.helpAll":
    "Alle {breaking} stehen auf der Release-Seite auf dieselbe Weise, jeder mit seiner zitierten Zeile und seiner eigenen Hilfe-Zeile.",

  // Short Specimens, the honest half of the argument.
  "landing.thin.title": "Und wenn die Notes nicht von dieser Art sind",
  "landing.thin.sub":
    "Die meisten Releases veröffentlichen keine {lines} Zeilen. Was Verdict mit den dünnen tut, ist dieselbe Disziplin, und darum steht es auf dieser Seite und nicht in einer FAQ.",
  "landing.thin.vite":
    "ein Changelog von {lines} Zeilen, in dem die zwei brechenden Zeilen mit einem einzigen {bang} markiert sind und zwischen einem {chore} und einem {perf} stehen. {link}",
  "landing.thin.viteLink": "sie getrennt lesen",
  "landing.thin.typescript":
    "ein Release, dessen Körper {blog} ist. Hier gibt es nichts zu beurteilen, also sagt Verdict genau das und zeigt, wo die echten Notes liegen. {link}",
  "landing.thin.typescriptBlog": "ein Link auf einen Blogbeitrag",
  "landing.thin.typescriptLink": "diesen Zustand ansehen",
  // The quotation marks are part of the sentence and not added by the component, so each language
  // uses its own pair: German opens below and closes above.
  "landing.thin.note":
    "Das ist der Satz, den Verdict anstelle eines Urteils ausgibt, wenn die Notes nur woandershin verweisen. „Ich habe keine Breaking Changes gefunden“ und „es gibt keine Breaking Changes“ sind zwei verschiedene Aussagen, und die zweite wird nie anstelle der ersten ausgegeben.",

  // Vocabulary Legend. The four definitions are CONTEXT.md's own sentences in the interface's
  // language.
  "landing.words.title": "Vier Wörter auf jedem Release",
  "landing.words.sub":
    "Relevanz ist eine Form neben der Version, nie ein Farbton: Farbe bedeutet in diesem Produkt Schwere und sonst nichts. Ein Release ist nicht dringend, weil es rot ist, es ist dringend, weil seine Notes es sagen, in einer Zeile, die du lesen kannst.",
  "landing.words.featured":
    "Das Release, in dem eine Technologie die Richtung wechselt: eine neue major, wo SemVer gilt, eine neue minor bei den Projekten, die ihre echten Änderungen dort ausliefern. Diese öffnen dein Dashboard, und sie sind die, die das Urteil der Seite zählt.",
  "landing.words.notable":
    "Neue Arbeit, kein Richtungswechsel: eine neue minor unter SemVer, eine ungerade Node-major. Lesenswert, selten dringend.",
  "landing.words.digest":
    "Was die Regel als Routine behandelt, Patches zuerst. Sie unterbrechen nie: du liest sie nach ISO-Woche gruppiert, in einem Durchgang.",
  "landing.words.preview":
    "Eine Beta oder ein Release Candidate. Nur die erste preview einer neuen major wird zusammengefasst, und Canaries, Nightlies und Alphas sind hier überhaupt keine Releases.",

  // The close, and the counter-position beside it.
  "landing.close.claim": {
    one: "Folge der einen Technologie, die über deine Woche entscheidet.",
    other: "Folge den {count} Technologien, die über deine Woche entscheiden.",
  },
  "landing.close.plan":
    "Der kostenlose Plan folgt bis zu {limit} Technologien aus einem von Hand gepflegten Katalog von {size}. Die Anmeldung läuft über GitHub, und die Release-Seiten bleiben ohne sie lesbar.",
  "landing.close.browse": {
    one: "die eine Technologie durchsehen",
    other: "alle {count} Technologien durchsehen",
  },
  "landing.close.note.claim": "es öffnet keine Pull Requests",
  "landing.close.note.body":
    "Dependabot und Renovate machen das gut, und sie sagen dir, dass eine Version sich bewegt hat. Ein Newsletter sagt dir, dass ein Release interessant war. Verdict beantwortet die Frage, die jene offen lassen: verlangt dieses Release etwas von mir, und wo steht das. Es liest nur die Release Notes, es rät nie, und wenn die Notes nichts sagen, sagt es nichts.",

  // The foot of the page, under the rule.
  "landing.foot.read": "Inhalt aus öffentlichen Release Notes gelesen",
  "landing.foot.notes": "Notes zu {name} {version}",

  // The entry action, in its two faces. `Mit GitHub weiter` is the login page's own button
  // (`account.login.button`) and this is the landing's invitation, which is why the two differ.
  "landing.entry.visitor": "Mit GitHub anmelden",
  "landing.entry.developer": "Zu deinem Dashboard",
} as const satisfies Partial<MessageDictionary>;
