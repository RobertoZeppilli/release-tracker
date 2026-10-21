import type { MessageDictionary } from "../index";

// The Dashboard, in French. The verdict is said with the glossary's own words: `action requise` is
// the name of the judgement, so a sentence about it reads `demande une action`. `digest` stays as
// it is, here and everywhere: it is the name of a Significance.
export const dashboard = {
  // ⚠️ Short because the Column verdict is: at 1.2rem inside a 326px panel the line holds about 26
  // characters, label included (DESIGN.md, The One-Line Verdict Rule, which says the copy gives way
  // and the scale never does).
  "dashboard.needsAction": {
    one: "{count} action",
    many: "{count} actions",
    other: "{count} actions",
  },
  "dashboard.verdict.ok": "aucune action",
  // ⚠️ Read at 360px: the rule is one line, and the copy is what gives way (DESIGN.md, The One-Line
  // Verdict Rule). This is the short form, like the English one it translates.
  "dashboard.verdict.none": "rien à juger",
  "dashboard.standing.noVersion": "aucune version déclarée",
  "dashboard.standing.upToDate": "à jour",
  "dashboard.standing.behind": {
    one: "{count} derrière {declared}",
    many: "{count} derrière {declared}",
    other: "{count} derrière {declared}",
  },
  "dashboard.standing.list": "Technologies suivies, par distance",
  "dashboard.totals.empty":
    "aucune version déclarée. déclarez-en une sur une page de technologie et les totaux arrivent ici.",
  "dashboard.totals.behind": "releases de retard en tout",
  "dashboard.totals.missing": "sans verdict",
  "dashboard.totals.since": "version déclarée la plus ancienne",
  "dashboard.barNote":
    "la barre est la distance depuis la version que vous avez déclarée, pas une note",
  "dashboard.quota.followed": "{count} sur {limit} suivies",
  "dashboard.quota.swap": "laissez-en une pour en suivre une autre",
  "dashboard.stream.title": "ce qui s’est passé · {days} derniers jours",
  // The count is a second span after the title, which is why the comma is inside the message.
  "dashboard.stream.count": {
    one: ", {count} release",
    many: ", {count} releases",
    other: ", {count} releases",
  },
  "dashboard.stream.thisWeek": "cette semaine",
  "dashboard.stream.window": "fenêtre : {days} derniers jours, du {start} au {end} UTC",
  "dashboard.stream.declaration": "vous êtes en {version}",
  "dashboard.stream.migrate": "migrer vers {name} {version}",
  // A day of a week's span: `2 déc` in French, where English writes `Dec 2`. The month comes from
  // `Intl`, so no language lists its own months here.
  "dashboard.week.day": "{day} {month}",
  "dashboard.week.range": "du {start} au {end}",
  "dashboard.week.number": "semaine {week}",
  "dashboard.digest.span.many": "semaines {from} à {to}",
  "dashboard.digest.claim": {
    one: "{count} release de plus, qui ne demande rien",
    many: "{count} releases de plus, aucune ne demande rien",
    other: "{count} releases de plus, aucune ne demande rien",
  },
  "dashboard.digest.count": {
    one: "{count} release digest",
    many: "{count} releases digest",
    other: "{count} releases digest",
  },
  "dashboard.digest.noAction": "aucune action nécessaire",
  "dashboard.empty.none": "vous ne suivez encore aucune technologie",
  "dashboard.empty.some": {
    one: "vous suivez {count} technologie",
    many: "vous suivez {count} technologies",
    other: "vous suivez {count} technologies",
  },
  "dashboard.empty.what":
    "Suivez les outils de votre stack. Cette page montre ensuite, pour chacun, les releases qui comptent des {days} derniers jours et si la mise à jour demande une action. Le plan Free suit jusqu’à {limit}.",
  "dashboard.empty.open": "Ouvrir le dashboard",
  "dashboard.empty.catalog": "dans le catalogue ({count})",
  "dashboard.empty.browse": {
    one: "parcourir la seule technologie ({count})",
    many: "parcourir les {count} technologies",
    other: "parcourir les {count} technologies",
  },
} as const satisfies Partial<MessageDictionary>;
