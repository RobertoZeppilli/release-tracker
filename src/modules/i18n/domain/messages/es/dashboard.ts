import type { MessageDictionary } from "../index";

// The Dashboard, in Spanish. The verdict is said with the glossary's own words: `intervención` is
// the noun of the judgement, so a sentence about it reads `requiere intervención`. `digest` stays
// as it is, here and everywhere: it is the name of a Significance.
export const dashboard = {
  // ⚠️ Short because the Column verdict is: at 1.2rem inside a 326px panel the line holds about 26
  // characters, label included (DESIGN.md, The One-Line Verdict Rule, which says the copy gives way
  // and the scale never does). So the claim is said with the noun and not with its verb.
  "dashboard.needsAction": {
    one: "{count} intervención",
    many: "{count} intervenciones",
    other: "{count} intervenciones",
  },
  "dashboard.verdict.ok": "ninguna intervención",
  // ⚠️ Read at 360px: the rule is one line, and the copy is what gives way (DESIGN.md, The One-Line
  // Verdict Rule). This is the short form, like the English one it translates.
  "dashboard.verdict.none": "nada que juzgar",
  "dashboard.standing.noVersion": "ninguna versión declarada",
  "dashboard.standing.upToDate": "al día",
  "dashboard.standing.behind": {
    one: "{count} detrás de {declared}",
    many: "{count} detrás de {declared}",
    other: "{count} detrás de {declared}",
  },
  "dashboard.standing.list": "Tecnologías seguidas, por distancia",
  "dashboard.totals.empty":
    "ninguna versión declarada. declara una en una página de tecnología y los totales llegan aquí.",
  "dashboard.totals.behind": "releases de distancia en total",
  "dashboard.totals.missing": "sin verdicto",
  "dashboard.totals.since": "versión declarada más antigua",
  "dashboard.barNote":
    "la barra es la distancia desde la versión que declaraste, no una nota",
  "dashboard.quota.followed": "{count} de {limit} seguidas",
  "dashboard.quota.swap": "deja una para seguir otra",
  "dashboard.stream.title": "qué ha pasado · últimos {days} días",
  // The count is a second span after the title, which is why the comma is inside the message.
  "dashboard.stream.count": {
    one: ", {count} release",
    many: ", {count} releases",
    other: ", {count} releases",
  },
  "dashboard.stream.thisWeek": "esta semana",
  "dashboard.stream.window": "ventana: últimos {days} días, del {start} al {end} UTC",
  "dashboard.stream.declaration": "estás en la {version}",
  "dashboard.stream.migrate": "migrar a {name} {version}",
  // A day of a week's span: `2 dic` in Spanish, where English writes `Dec 2`. The month comes from
  // `Intl`, so no language lists its own months here.
  "dashboard.week.day": "{day} {month}",
  "dashboard.week.range": "del {start} al {end}",
  "dashboard.week.number": "semana {week}",
  "dashboard.digest.span.many": "semanas {from} a {to}",
  "dashboard.digest.claim": {
    one: "{count} release más, que no pide nada",
    many: "{count} releases más, ninguna pide nada",
    other: "{count} releases más, ninguna pide nada",
  },
  "dashboard.digest.count": {
    one: "{count} release digest",
    many: "{count} releases digest",
    other: "{count} releases digest",
  },
  "dashboard.digest.noAction": "no hace falta intervenir",
  "dashboard.empty.none": "aún no sigues ninguna tecnología",
  "dashboard.empty.some": {
    one: "sigues {count} tecnología",
    many: "sigues {count} tecnologías",
    other: "sigues {count} tecnologías",
  },
  "dashboard.empty.what":
    "Sigue las herramientas de tu stack. Esta página muestra entonces, para cada una, las releases que importan de los últimos {days} días y si actualizar requiere intervención. El plan Free sigue hasta {limit}.",
  "dashboard.empty.open": "Abrir el dashboard",
  "dashboard.empty.catalog": "en el catálogo ({count})",
  "dashboard.empty.browse": {
    one: "explorar la única tecnología ({count})",
    many: "explorar las {count} tecnologías",
    other: "explorar las {count} tecnologías",
  },
} as const satisfies Partial<MessageDictionary>;
