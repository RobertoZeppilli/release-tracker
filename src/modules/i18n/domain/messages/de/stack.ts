import type { MessageDictionary } from "../index";

// What a Developer follows, in German: the Stack column, the Catalog column beside it, the Follow
// and its refusals, the quota, and the Version in use.
// ⚠️ The Categories (`language`, `framework`, `build tool`, …) and the two layouts (`rows`, `grid`)
// are **values**, not words: they are written in the address and in the stored preference, so they
// stay as they are in every language (ADR 0008).
// ⚠️ Two German verbs for one English one, and the grammar is what splits them: `folgen` takes a
// dative object, so it is the verb of every sentence and every button here (`{name} folgen`,
// `einer anderen zu folgen`), but it forms no attributive participle and no personal passive, so
// `gefolgte Technologien` and `kann nicht wieder gefolgt werden` are not German. Those positions
// read `verfolgt`, which is the verb this dictionary already uses where the product does the
// tracking (`wird nicht mehr verfolgt`, in `catalog`).
export const stack = {
  "stack.title": "was du verfolgst, nach Namen",
  "stack.figure.followed": "verfolgt",
  "stack.figure.left": "frei in deinem Free-Plan",
  "stack.seeDashboard": "sie auf deinem Dashboard sehen",
  "stack.empty": "noch nichts. folge etwas aus dem Katalog, und es landet hier.",
  "stack.retired.title": "herausgenommen, weiter deine",
  "stack.retired.note":
    "nicht mehr im Katalog und bekommen keine neuen Releases. Vergangene Releases bleiben lesbar, sie zählen weiter auf deine {limit}, und einmal losgelassen kann man ihnen nicht wieder folgen.",
  "stack.row.lastVersion": "letzte {version}",
  "stack.row.gone": "losgelassen, endgültig",
  "stack.row.unfollow": "nicht mehr folgen",
  "stack.unfollowed": "nicht mehr verfolgt · kann nicht wieder verfolgt werden",
  // The Follow, in its two states. The label says what a press does next, and the accessible name
  // names the Technology, because a page carries many of these buttons (WCAG 2.5.3).
  "stack.follow": "Folgen",
  "stack.following": "Gefolgt",
  "stack.followName": "{name} folgen",
  "stack.unfollowName": "{name} nicht mehr folgen",
  "stack.selectName": "{name} auswählen",
  // The quota, which the Dashboard prints too: one sentence, so one key, wherever it is read.
  "stack.quota.label": "Verfolgte Technologien",
  "stack.quota.short": "{count} verfolgt",
  "stack.quota.followed": "{count} von {limit} verfolgt",
  "stack.quota.swap": "lass eine los, um einer anderen zu folgen",
  "stack.limit.full":
    "dein Free-Plan ist voll. lass eine von denen los, denen du folgst, um einer anderen zu folgen.",
  // What the database refused, and the way out, which is the Developer's own in all three.
  "stack.rejected.limit":
    "nicht verfolgt. dein Free-Plan ist in einer anderen Session voll geworden, also lass eine los, um einer anderen zu folgen.",
  "stack.rejected.retired":
    "nicht verfolgt · sie hat den Katalog verlassen · einer herausgenommenen Technologie kann man nicht wieder folgen",
  "stack.rejected.failed":
    "nicht gespeichert · die Änderung hat die Datenbank nicht erreicht · versuch es noch einmal",
  // A group Follow. The wall is named before the press and inked only once the database says so.
  "stack.selection.count": "{count} ausgewählt",
  "stack.selection.follow": "{count} folgen",
  "stack.selection.clear": "leeren",
  "stack.wall.full": {
    one: "dein Free-Plan ist voll, und {count} ist ausgewählt.",
    other: "dein Free-Plan ist voll, und {count} sind ausgewählt.",
  },
  "stack.wall.room": {
    one: "dein Free-Plan hat Platz für {room} weitere, und {count} ist ausgewählt.",
    other: "dein Free-Plan hat Platz für {room} weitere, und {count} sind ausgewählt.",
  },
  "stack.group.limit": "keine verfolgt. {wall}",
  "stack.group.retired":
    "keine verfolgt. eine davon hat den Katalog verlassen, nimm sie also aus der Auswahl.",
  "stack.group.failed":
    "keine verfolgt. die Änderung hat die Datenbank nicht erreicht, versuch es also noch einmal.",
  // The Catalog column.
  "stack.catalog.byCategory": "was du hinzufügen könntest, nach Kategorie",
  "stack.catalog.byRelease": "was du hinzufügen könntest, nach letztem Release",
  "stack.catalog.intro": "jedes Release hier wird einmal zusammengefasst, für alle",
  "stack.catalog.layout": "Anordnung des Katalogs",
  "stack.catalog.selectMany": "mehrere auswählen",
  "stack.catalog.sortedBy": "sortiert nach",
  "stack.catalog.sort.category": "Kategorie",
  "stack.catalog.sort.release": "letztes Release",
  "stack.catalog.category": "Kategorie",
  "stack.catalog.all": "alle",
  "stack.catalog.find": "eine Technologie finden",
  "stack.catalog.placeholder": "Name oder Beschreibung",
  // The count says where it is counting, so a small total never reads as a small Catalog.
  "stack.catalog.match": "{shown} von {total} passen",
  "stack.catalog.matchIn": "{shown} von {total} passen in {category}",
  "stack.catalog.total": {
    one: "{count} Technologie",
    other: "{count} Technologien",
  },
  "stack.catalog.totalIn": {
    one: "{count} Technologie in {category}",
    other: "{count} Technologien in {category}",
  },
  "stack.catalog.shownOf": "{shown} von {total}",
  "stack.catalog.keys": "/ drücken zum Suchen, esc zum Leeren",
  "stack.catalog.latestFirst": "letztes Release zuerst",
  "stack.catalog.latest": "letzte {version}",
  "stack.catalog.latestOn": "letzte {version} am {date}",
  "stack.catalog.noMatch": "keine Technologie passt zu „{query}“",
  "stack.catalog.curated":
    "Der Katalog ist von Hand gepflegt, und Anfragen für neue Technologien sind noch nicht offen.",
  // The Version in use, declared on a Technology page and read by the Upgrade Path.
  "stack.version.form": "Eingesetzte Version von {name}",
  "stack.version.label": "im Einsatz",
  "stack.version.field": "Eingesetzte Version",
  "stack.version.save": "Speichern",
  "stack.version.clear": "Leeren",
  "stack.version.declared": "angegeben am {date}",
  "stack.version.none": "nicht angegeben",
  "stack.version.denied": "Die eingesetzte Version wurde nicht gespeichert. Versuch es noch einmal.",
} as const satisfies Partial<MessageDictionary>;
