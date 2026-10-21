import type { MessageDictionary } from "../index";

// The Upgrade Path, in German: `Upgrade-Pfad`, the name chosen for it in this language, because
// `Upgrade` is the word a German developer uses for the thing this page is about. `featured`,
// `notable`, `digest` and `major` stay as they are: the first three are the product's grammar
// (ADR 0008) and `major` is the word the reader already uses for a version.
export const path = {
  "path.title": "upgrade-pfad",
  "path.latest": "neueste",
  // The visible word has to sit inside the accessible name, as WCAG 2.5.3 asks: `von` is inside
  // `Upgrade von`.
  "path.from": "von",
  "path.from.name": "Upgrade von",
  "path.check": "Prüfen",
  "path.whatToDo": "Was zu tun ist",
  "path.changed.inOrder": "was sich geändert hat, in der Reihenfolge des Upgrades",
  "path.changed.newest": "was sich geändert hat, neueste major zuerst",
  "path.previews.ahead": "jenseits von {version}",
  "path.previews.upcoming": "kommend",
  "path.legend.label": "Füllung der Balken",
  "path.legend.action": "braucht einen Eingriff",
  // ⚠️ The same 26 characters the Dashboard verdict has, for the same reason: this is the other
  // Column verdict (DESIGN.md), and German is the worst case for word length. The clause inside the
  // sentence below keeps the verb.
  "path.verdict.action": {
    one: "{count} Eingriff",
    other: "{count} Eingriffe",
  },
  "path.verdict.missing": "{count} ohne Urteil",
  "path.verdict.upToDate": "alles aktuell",
  "path.safe": "Upgrade unbedenklich",
  "path.sentence.latest": "{from} ist bereits das neueste stabile Release.",
  "path.sentence.all": "Zwischen {from} und {to} {total}: {list}.",
  "path.sentence.total": {
    one: "gibt es {count} Release",
    other: "gibt es {count} Releases",
  },
  "path.list.last": "{items} und {last}",
  "path.clause.action": {
    one: "{count} braucht einen Eingriff",
    other: "{count} brauchen einen Eingriff",
  },
  "path.clause.safe": {
    one: "{count} ist unbedenklich",
    other: "{count} sind unbedenklich",
  },
  "path.clause.noSummary": {
    one: "{count} hat noch keine Zusammenfassung (sieh in seine Notes)",
    other: "{count} haben noch keine Zusammenfassung (sieh in ihre Notes)",
  },
  "path.clause.unjudged": {
    one: "{count} hat zu dünne Notes für ein Urteil",
    other: "{count} haben zu dünne Notes für ein Urteil",
  },
  "path.clause.digest": {
    one: "{count} ist ein digest-Fix, den du überspringen kannst",
    other: "{count} sind digest-Fixes, die du überspringen kannst",
  },
  // The rows of the panel. The figure is printed in a column of its own, so none of these carries
  // `{count}`: the count is passed all the same, because it is what chooses the plural form.
  "path.row.total": {
    one: "Release, {from} bis {to}",
    other: "Releases, {from} bis {to}",
  },
  "path.row.action": {
    one: "braucht einen Eingriff",
    other: "brauchen einen Eingriff",
  },
  "path.row.noSummary": "noch keine Zusammenfassung",
  "path.row.unjudged": "Notes zu dünn für ein Urteil",
  "path.row.digest": {
    one: "digest-Fix, den du überspringen kannst",
    other: "digest-Fixes, die du überspringen kannst",
  },
  "path.showAll": {
    one: "das eine Release zeigen ({count})",
    other: "alle {count} Releases zeigen",
  },
  "path.history.nothing": "noch nichts erfasst.",
  "path.history.all": "die ganze erfasste Historie, {releases} in {majors}.",
  "path.history.allAndPreviews":
    "die ganze erfasste Historie, {releases} in {majors}, und {previews}.",
  "path.history.previewsOnly": "die ganze erfasste Historie, {previews}.",
  "path.history.label": "Erfasste Historie",
  "path.history.back": "zurück zum Upgrade-Pfad",
  "path.count.releases": {
    one: "{count} Release",
    other: "{count} Releases",
  },
  "path.count.majors": {
    one: "{count} major",
    other: "{count} majors",
  },
  "path.count.previews": {
    one: "{count} kommende preview",
    other: "{count} kommende previews",
  },
  // The stat row beside a bar. `missing` holds two different facts and neither may be printed as
  // the other: a Release with no Summary is not summarized, one whose notes could not be judged is
  // there to be checked.
  "path.kind.featured": "{count} featured",
  "path.kind.notable": "{count} notable",
  "path.kind.digest": "{count} digest",
  "path.missing.notSummarized": "{count} nicht zusammengefasst",
  "path.missing.toCheck": "{count} zu prüfen",
  "path.after": "nach {version}",
  "path.start.note":
    "Start bei {version}, {which}, weil keine Version angegeben wurde.",
  "path.start.previousMajor": "das letzte Release der vorigen major",
  "path.start.oldest": "das älteste erfasste Release",
  // What the form answers with. `major.minor.patch` is the shape of a Version, not a word.
  "path.invalid.malformed":
    "{from} ist keine Version. Schreib sie als major.minor.patch, zum Beispiel {example}.",
  "path.invalid.empty": "Ein leerer Wert",
  "path.invalid.notOlder":
    "{from} ist neuer als {latest}, das neueste stabile Release.",
  "path.invalid.noStable":
    "Es gibt noch kein stabiles Release, also gibt es keinen Upgrade-Pfad.",
  "path.unrecorded.why":
    "{from} ist kein erfasstes {name}-Release, also zählt der Pfad die erfassten Releases danach.",
  // Split from the links that follow it, because a message cannot carry an element (`message.ts`).
  "path.unrecorded.ask": "Meintest du",
  "path.or": "oder",
} as const satisfies Partial<MessageDictionary>;
