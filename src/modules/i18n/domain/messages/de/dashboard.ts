import type { MessageDictionary } from "../index";

// The Dashboard, in German. The verdict is said with the glossary's own words: `Eingriff` is the
// noun of the judgement, so a sentence about it reads `Eingriff nötig`. `digest` stays as it is,
// here and everywhere: it is the name of a Significance.
export const dashboard = {
  // ⚠️ Short because the Column verdict is: at 1.2rem inside a 326px panel the line holds about 26
  // characters, label included (DESIGN.md, The One-Line Verdict Rule, which says the copy gives way
  // and the scale never does). German is the worst case for word length in the five, so the claim
  // is the noun alone: `warning: 2 Releases brauchen einen Eingriff` is 42 characters and would
  // wrap where the rule says one line.
  "dashboard.needsAction": {
    one: "{count} Eingriff",
    other: "{count} Eingriffe",
  },
  "dashboard.verdict.ok": "kein Eingriff nötig",
  // ⚠️ Read at 360px: the rule is one line, and the copy is what gives way (DESIGN.md, The One-Line
  // Verdict Rule). This is the short form, like the English one it translates.
  "dashboard.verdict.none": "noch nichts beurteilt",
  "dashboard.standing.noVersion": "keine Version angegeben",
  "dashboard.standing.upToDate": "aktuell",
  "dashboard.standing.behind": {
    one: "{count} hinter {declared}",
    other: "{count} hinter {declared}",
  },
  "dashboard.standing.list": "Verfolgte Technologien, nach Abstand",
  "dashboard.totals.empty":
    "noch keine Version angegeben. gib eine auf einer Technologieseite an, und die Summen landen hier.",
  "dashboard.totals.behind": "Releases Abstand insgesamt",
  "dashboard.totals.missing": "ohne Urteil",
  "dashboard.totals.since": "älteste angegebene Version",
  "dashboard.barNote":
    "der Balken ist der Abstand zur Version, die du angegeben hast, keine Note",
  "dashboard.quota.followed": "{count} von {limit} verfolgt",
  "dashboard.quota.swap": "lass eine los, um einer anderen zu folgen",
  "dashboard.stream.title": "was passiert ist · letzte {days} Tage",
  // The count is a second span after the title, which is why the comma is inside the message.
  "dashboard.stream.count": {
    one: ", {count} Release",
    other: ", {count} Releases",
  },
  "dashboard.stream.thisWeek": "diese Woche",
  "dashboard.stream.window": "Fenster: letzte {days} Tage, {start} bis {end} UTC",
  "dashboard.stream.declaration": "du bist auf {version}",
  "dashboard.stream.migrate": "auf {name} {version} migrieren",
  // A day of a week's span: `2. Dez` in German, where English writes `Dec 2`. The month comes from
  // `Intl`, so no language lists its own months here.
  "dashboard.week.day": "{day}. {month}",
  "dashboard.week.range": "{start} bis {end}",
  "dashboard.week.number": "Woche {week}",
  "dashboard.digest.span.many": "Wochen {from} bis {to}",
  "dashboard.digest.claim": {
    one: "{count} Release mehr, das nichts verlangt",
    other: "{count} Releases mehr, von denen keines etwas verlangt",
  },
  "dashboard.digest.count": {
    one: "{count} digest-Release",
    other: "{count} digest-Releases",
  },
  // Not `kein Eingriff nötig` again: that is the page verdict two screens above, and one sentence
  // said twice is one sentence to translate twice.
  "dashboard.digest.noAction": "nichts zu tun",
  "dashboard.empty.none": "du folgst noch keiner Technologie",
  "dashboard.empty.some": {
    one: "du folgst {count} Technologie",
    other: "du folgst {count} Technologien",
  },
  "dashboard.empty.what":
    "Folge den Werkzeugen in deinem Stack. Diese Seite zeigt dann für jedes die Releases, die zählen, aus den letzten {days} Tagen, und ob ein Upgrade einen Eingriff braucht. Der Free-Plan folgt bis zu {limit}.",
  "dashboard.empty.open": "Dashboard öffnen",
  "dashboard.empty.catalog": "im Katalog ({count})",
  "dashboard.empty.browse": {
    one: "die einzige Technologie durchsehen ({count})",
    other: "alle {count} Technologien durchsehen",
  },
} as const satisfies Partial<MessageDictionary>;
