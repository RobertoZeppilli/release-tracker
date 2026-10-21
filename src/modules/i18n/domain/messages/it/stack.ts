import type { MessageDictionary } from "../index";

// What a Developer follows, in Italian. The Categories and the two layouts are **values** written in
// the address and in the stored preference, so they are not in the dictionary at all (ADR 0008);
// `category` as the word the reader reads is `Genere`, which is the glossary's name for it
// (CONTEXT.md). `piano free` keeps `Free`, which is the name of a Plan.
export const stack = {
  "stack.title": "cosa segui, per nome",
  "stack.figure.followed": "seguite",
  "stack.figure.left": "ancora libere sul tuo piano free",
  "stack.seeDashboard": "vedile sulla tua Dashboard",
  "stack.empty": "ancora niente. segui qualcosa dal catalogo e arriva qui.",
  "stack.retired.title": "ritirate, ancora tue",
  "stack.retired.note":
    "non sono più nel catalogo e non ricevono nuove release. Le release passate restano consultabili, contano ancora nel tuo limite di {limit}, e una volta lasciate andare non si possono seguire di nuovo.",
  "stack.row.lastVersion": "ultima {version}",
  "stack.row.gone": "lasciata andare, per sempre",
  "stack.row.unfollow": "smetti di seguire",
  "stack.unfollowed": "non più seguita · non si può seguire di nuovo",
  // The label says what a press does next; the accessible name names the Technology, because a page
  // carries many of these buttons (WCAG 2.5.3).
  "stack.follow": "Segui",
  "stack.following": "Seguita",
  "stack.followName": "Segui {name}",
  "stack.unfollowName": "Smetti di seguire {name}",
  "stack.selectName": "Seleziona {name}",
  "stack.quota.label": "Tecnologie seguite",
  "stack.quota.short": "{count} seguite",
  "stack.quota.followed": "{count} di {limit} seguite",
  "stack.quota.swap": "smetti di seguirne una per seguirne un'altra",
  "stack.limit.full":
    "il tuo piano free è pieno. lasciane andare una tra quelle che segui per seguirne un'altra.",
  "stack.rejected.limit":
    "non seguita. il tuo piano free si è riempito in un'altra sessione, quindi lasciane andare una per seguirne un'altra.",
  "stack.rejected.retired":
    "non seguita · ha lasciato il catalogo · una tecnologia ritirata non si può seguire di nuovo",
  "stack.rejected.failed": "non salvata · la modifica non è arrivata al database · riprova",
  "stack.selection.count": "{count} selezionate",
  "stack.selection.follow": "Segui {count}",
  "stack.selection.clear": "svuota",
  "stack.wall.full": {
    one: "il tuo piano free è pieno, e {count} è selezionata.",
    many: "il tuo piano free è pieno, e {count} sono selezionate.",
    other: "il tuo piano free è pieno, e {count} sono selezionate.",
  },
  "stack.wall.room": {
    one: "il tuo piano free ha posto per altre {room}, e {count} è selezionata.",
    many: "il tuo piano free ha posto per altre {room}, e {count} sono selezionate.",
    other: "il tuo piano free ha posto per altre {room}, e {count} sono selezionate.",
  },
  "stack.group.limit": "nessuna seguita. {wall}",
  "stack.group.retired":
    "nessuna seguita. una di loro ha lasciato il catalogo, quindi togliala dalla selezione.",
  "stack.group.failed":
    "nessuna seguita. la modifica non è arrivata al database, quindi riprova.",
  "stack.catalog.byCategory": "cosa potresti aggiungere, per genere",
  "stack.catalog.byRelease": "cosa potresti aggiungere, per ultima release",
  "stack.catalog.intro": "ogni release qui è sintetizzata una volta, per tutti",
  "stack.catalog.layout": "Disposizione del catalogo",
  "stack.catalog.selectMany": "selezione multipla",
  "stack.catalog.sortedBy": "ordinato per",
  "stack.catalog.sort.category": "genere",
  "stack.catalog.sort.release": "ultima release",
  "stack.catalog.category": "Genere",
  "stack.catalog.all": "tutti",
  "stack.catalog.find": "trova una tecnologia",
  "stack.catalog.placeholder": "nome o descrizione",
  "stack.catalog.match": "{shown} di {total} corrispondono",
  "stack.catalog.matchIn": "{shown} di {total} corrispondono in {category}",
  "stack.catalog.total": {
    one: "{count} tecnologia",
    many: "{count} tecnologie",
    other: "{count} tecnologie",
  },
  "stack.catalog.totalIn": {
    one: "{count} tecnologia in {category}",
    many: "{count} tecnologie in {category}",
    other: "{count} tecnologie in {category}",
  },
  "stack.catalog.shownOf": "{shown} di {total}",
  "stack.catalog.keys": "premi / per cercare, esc per svuotare",
  "stack.catalog.latestFirst": "ultima release per prima",
  "stack.catalog.latest": "ultima {version}",
  "stack.catalog.latestOn": "ultima {version} del {date}",
  "stack.catalog.noMatch": "nessuna tecnologia corrisponde a “{query}”",
  "stack.catalog.curated":
    "Il catalogo è curato, e le richieste di nuove tecnologie non sono ancora aperte.",
  "stack.version.form": "Versione di {name} in uso",
  "stack.version.label": "in uso",
  "stack.version.field": "Versione in uso",
  "stack.version.save": "Salva",
  "stack.version.clear": "Svuota",
  "stack.version.declared": "dichiarata il {date}",
  "stack.version.none": "non dichiarata",
  "stack.version.denied": "La versione in uso non è stata salvata. Riprova.",
} as const satisfies Partial<MessageDictionary>;
