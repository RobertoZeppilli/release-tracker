import type { MessageDictionary } from "../index";

// What a Developer follows, in Spanish: the Stack column, the Catalog column beside it, the Follow
// and its refusals, the quota, and the Version in use.
// ⚠️ The Categories (`language`, `framework`, `build tool`, …) and the two layouts (`rows`, `grid`)
// are **values**, not words: they are written in the address and in the stored preference, so they
// stay as they are in every language (ADR 0008).
export const stack = {
  "stack.title": "lo que sigues, por nombre",
  "stack.figure.followed": "seguidas",
  "stack.figure.left": "libres en tu plan Free",
  "stack.seeDashboard": "verlas en tu dashboard",
  "stack.empty": "nada todavía. sigue algo del catálogo y aparece aquí.",
  "stack.retired.title": "retiradas, aún tuyas",
  "stack.retired.note":
    "ya no están en el catálogo y no reciben releases nuevas. Las releases pasadas siguen consultables, siguen contando para tus {limit}, y una vez dejadas no se pueden volver a seguir.",
  "stack.row.lastVersion": "última {version}",
  "stack.row.gone": "dejada, para siempre",
  "stack.row.unfollow": "dejar de seguir",
  "stack.unfollowed": "dejada · no se puede volver a seguir",
  // The Follow, in its two states. The label says what a press does next, and the accessible name
  // names the Technology, because a page carries many of these buttons (WCAG 2.5.3).
  "stack.follow": "Seguir",
  "stack.following": "Siguiendo",
  "stack.followName": "Seguir {name}",
  "stack.unfollowName": "Dejar de seguir {name}",
  "stack.selectName": "Seleccionar {name}",
  // The quota, which the Dashboard prints too: one sentence, so one key, wherever it is read.
  "stack.quota.label": "Tecnologías seguidas",
  "stack.quota.short": "{count} seguidas",
  "stack.quota.followed": "{count} de {limit} seguidas",
  "stack.quota.swap": "deja una para seguir otra",
  "stack.limit.full":
    "tu plan Free está lleno. deja una de las que sigues para seguir otra.",
  // What the database refused, and the way out, which is the Developer's own in all three.
  "stack.rejected.limit":
    "no seguida. tu plan Free se llenó en otra sesión, así que deja una para seguir otra.",
  "stack.rejected.retired":
    "no seguida · ha salido del catálogo · una tecnología retirada no se puede volver a seguir",
  "stack.rejected.failed":
    "no guardada · el cambio no llegó a la base de datos · vuelve a probar",
  // A group Follow. The wall is named before the press and inked only once the database says so.
  "stack.selection.count": "{count} seleccionadas",
  "stack.selection.follow": "Seguir {count}",
  "stack.selection.clear": "limpiar",
  "stack.wall.full": {
    one: "tu plan Free está lleno, y hay {count} seleccionada.",
    many: "tu plan Free está lleno, y hay {count} seleccionadas.",
    other: "tu plan Free está lleno, y hay {count} seleccionadas.",
  },
  "stack.wall.room": {
    one: "tu plan Free tiene sitio para {room} más, y hay {count} seleccionada.",
    many: "tu plan Free tiene sitio para {room} más, y hay {count} seleccionadas.",
    other: "tu plan Free tiene sitio para {room} más, y hay {count} seleccionadas.",
  },
  "stack.group.limit": "ninguna seguida. {wall}",
  "stack.group.retired":
    "ninguna seguida. una de ellas ha salido del catálogo, así que quítala de la selección.",
  "stack.group.failed":
    "ninguna seguida. el cambio no llegó a la base de datos, así que vuelve a probar.",
  // The Catalog column.
  "stack.catalog.byCategory": "lo que podrías añadir, por categoría",
  "stack.catalog.byRelease": "lo que podrías añadir, por última release",
  "stack.catalog.intro": "cada release de aquí se sintetiza una vez, para todos",
  "stack.catalog.layout": "Disposición del catálogo",
  "stack.catalog.selectMany": "seleccionar varias",
  "stack.catalog.sortedBy": "ordenado por",
  "stack.catalog.sort.category": "categoría",
  "stack.catalog.sort.release": "última release",
  "stack.catalog.category": "Categoría",
  "stack.catalog.all": "todas",
  "stack.catalog.find": "encontrar una tecnología",
  "stack.catalog.placeholder": "nombre o descripción",
  // The count says where it is counting, so a small total never reads as a small Catalog.
  "stack.catalog.match": "{shown} de {total} coinciden",
  "stack.catalog.matchIn": "{shown} de {total} coinciden en {category}",
  "stack.catalog.total": {
    one: "{count} tecnología",
    many: "{count} tecnologías",
    other: "{count} tecnologías",
  },
  "stack.catalog.totalIn": {
    one: "{count} tecnología en {category}",
    many: "{count} tecnologías en {category}",
    other: "{count} tecnologías en {category}",
  },
  "stack.catalog.shownOf": "{shown} de {total}",
  "stack.catalog.keys": "pulsa / para buscar, esc para limpiar",
  "stack.catalog.latestFirst": "última release primero",
  "stack.catalog.latest": "última {version}",
  "stack.catalog.latestOn": "última {version} el {date}",
  "stack.catalog.noMatch": "ninguna tecnología coincide con «{query}»",
  "stack.catalog.curated":
    "El catálogo está curado a mano, y las peticiones de tecnologías nuevas aún no están abiertas.",
  // The Version in use, declared on a Technology page and read by the Upgrade Path.
  "stack.version.form": "Versión de {name} en uso",
  "stack.version.label": "en uso",
  "stack.version.field": "Versión en uso",
  "stack.version.save": "Guardar",
  "stack.version.clear": "Limpiar",
  "stack.version.declared": "declarada el {date}",
  "stack.version.none": "sin declarar",
  "stack.version.denied": "La versión en uso no se ha guardado. Vuelve a probar.",
} as const satisfies Partial<MessageDictionary>;
