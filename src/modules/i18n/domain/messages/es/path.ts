import type { MessageDictionary } from "../index";

// The Upgrade Path, in Spanish: `ruta de actualización`, the name chosen for it in this language.
// `featured`, `notable`, `digest` and `major` stay as they are: the first three are the product's
// grammar (ADR 0008) and `major` is the word the reader already uses for a version.
export const path = {
  "path.title": "ruta de actualización",
  "path.latest": "última",
  // The visible word has to sit inside the accessible name, as WCAG 2.5.3 asks: `desde` is inside
  // `Actualizar desde`.
  "path.from": "desde",
  "path.from.name": "Actualizar desde",
  "path.check": "Comprobar",
  "path.whatToDo": "Qué hacer",
  "path.changed.inOrder": "qué ha cambiado, en el orden en que actualizas",
  "path.changed.newest": "qué ha cambiado, desde la major más reciente",
  "path.previews.ahead": "más allá de la {version}",
  "path.previews.upcoming": "por llegar",
  "path.legend.label": "Relleno de las barras",
  "path.legend.action": "requiere intervención",
  // ⚠️ The same 26 characters the Dashboard verdict has, for the same reason: this is the other
  // Column verdict (DESIGN.md). The clause inside the sentence below keeps the verb.
  "path.verdict.action": {
    one: "{count} intervención",
    many: "{count} intervenciones",
    other: "{count} intervenciones",
  },
  "path.verdict.missing": "{count} sin verdicto",
  "path.verdict.upToDate": "todo al día",
  "path.safe": "actualización segura",
  "path.sentence.latest": "{from} ya es la última release estable.",
  "path.sentence.all": "Entre la {from} y la {to} {total}: {list}.",
  "path.sentence.total": {
    one: "hay {count} release",
    many: "hay {count} releases",
    other: "hay {count} releases",
  },
  "path.list.last": "{items} y {last}",
  "path.clause.action": {
    one: "{count} requiere intervención",
    many: "{count} requieren intervención",
    other: "{count} requieren intervención",
  },
  "path.clause.safe": {
    one: "{count} es una actualización segura",
    many: "{count} son actualizaciones seguras",
    other: "{count} son actualizaciones seguras",
  },
  "path.clause.noSummary": {
    one: "{count} aún no tiene síntesis (mira sus notas)",
    many: "{count} aún no tienen síntesis (mira sus notas)",
    other: "{count} aún no tienen síntesis (mira sus notas)",
  },
  "path.clause.unjudged": {
    one: "{count} tiene notas demasiado escasas para juzgar",
    many: "{count} tienen notas demasiado escasas para juzgar",
    other: "{count} tienen notas demasiado escasas para juzgar",
  },
  "path.clause.digest": {
    one: "{count} es un arreglo digest que puedes saltarte",
    many: "{count} son arreglos digest que puedes saltarte",
    other: "{count} son arreglos digest que puedes saltarte",
  },
  // The rows of the panel. The figure is printed in a column of its own, so none of these carries
  // `{count}`: the count is passed all the same, because it is what chooses the plural form.
  "path.row.total": {
    one: "release, de la {from} a la {to}",
    many: "releases, de la {from} a la {to}",
    other: "releases, de la {from} a la {to}",
  },
  "path.row.action": {
    one: "requiere intervención",
    many: "requieren intervención",
    other: "requieren intervención",
  },
  "path.row.noSummary": "aún sin síntesis",
  "path.row.unjudged": "notas demasiado escasas para juzgar",
  "path.row.digest": {
    one: "arreglo digest que puedes saltarte",
    many: "arreglos digest que puedes saltarte",
    other: "arreglos digest que puedes saltarte",
  },
  "path.showAll": {
    one: "mostrar la única release ({count})",
    many: "mostrar las {count} releases",
    other: "mostrar las {count} releases",
  },
  "path.history.nothing": "aún no hay nada registrado.",
  "path.history.all": "todo el historial registrado, {releases} en {majors}.",
  "path.history.allAndPreviews":
    "todo el historial registrado, {releases} en {majors}, y {previews}.",
  "path.history.previewsOnly": "todo el historial registrado, {previews}.",
  "path.history.label": "Historial registrado",
  "path.history.back": "volver a la ruta de actualización",
  "path.count.releases": {
    one: "{count} release",
    many: "{count} releases",
    other: "{count} releases",
  },
  "path.count.majors": {
    one: "{count} major",
    many: "{count} majors",
    other: "{count} majors",
  },
  "path.count.previews": {
    one: "{count} preview por llegar",
    many: "{count} previews por llegar",
    other: "{count} previews por llegar",
  },
  // The stat row beside a bar. `missing` holds two different facts and neither may be printed as
  // the other: a Release with no Summary is not summarized, one whose notes could not be judged is
  // there to be checked.
  "path.kind.featured": "{count} featured",
  "path.kind.notable": "{count} notable",
  "path.kind.digest": "{count} digest",
  "path.missing.notSummarized": "{count} sin sintetizar",
  "path.missing.toCheck": "{count} por comprobar",
  "path.after": "después de la {version}",
  "path.start.note":
    "empezando por la {version}, {which}, porque no se dio ninguna versión.",
  "path.start.previousMajor": "la última release de la major anterior",
  "path.start.oldest": "la release más antigua registrada",
  // What the form answers with. `major.minor.patch` is the shape of a Version, not a word.
  "path.invalid.malformed":
    "{from} no es una versión. Escríbela como major.minor.patch, por ejemplo {example}.",
  "path.invalid.empty": "Un valor vacío",
  "path.invalid.notOlder":
    "{from} es más reciente que la {latest}, la última release estable.",
  "path.invalid.noStable":
    "Todavía no hay ninguna release estable, así que no hay ruta de actualización.",
  "path.unrecorded.why":
    "{from} no es una release de {name} registrada, así que la ruta cuenta las releases registradas después de ella.",
  // Split from the links that follow it, because a message cannot carry an element (`message.ts`).
  "path.unrecorded.ask": "¿Querías decir",
  "path.or": "o",
} as const satisfies Partial<MessageDictionary>;
