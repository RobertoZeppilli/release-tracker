import type { MessageDictionary } from "../index";

// What a Developer follows, in French: the Stack column, the Catalog column beside it, the Follow
// and its refusals, and the Version in use.
// ⚠️ The Categories (`language`, `framework`, `build tool`, …) and the two layouts (`rows`, `grid`)
// are **values**, not words: they are written in the address and in the stored preference, so they
// stay as they are in every language (ADR 0008).
export const stack = {
  "stack.title": "ce que vous suivez, par nom",
  "stack.figure.followed": "suivies",
  "stack.seeDashboard": "les voir sur votre dashboard",
  "stack.empty": "rien pour le moment. suivez quelque chose du catalogue et cela arrive ici.",
  "stack.retired.title": "retirées, toujours les vôtres",
  "stack.retired.note":
    "plus dans le catalogue et ne recevant plus de releases. Les releases passées restent consultables, et une fois laissées elles ne peuvent plus être suivies.",
  "stack.row.lastVersion": "dernière {version}",
  "stack.row.gone": "laissée, définitivement",
  "stack.row.unfollow": "ne plus suivre",
  "stack.unfollowed": "plus suivie · ne peut plus être suivie",
  // The Follow, in its two states. The label says what a press does next, and the accessible name
  // names the Technology, because a page carries many of these buttons (WCAG 2.5.3).
  "stack.follow": "Suivre",
  "stack.following": "Suivie",
  "stack.followName": "Suivre {name}",
  "stack.unfollowName": "Ne plus suivre {name}",
  "stack.selectName": "Sélectionner {name}",
  // What the database refused, and the way out, which is the Developer's own in all three.
  "stack.rejected.retired":
    "pas suivie · elle a quitté le catalogue · une technologie retirée ne peut plus être suivie",
  "stack.rejected.failed":
    "pas enregistrée · le changement n’a pas atteint la base de données · réessayez",
  // A group Follow, said once for the group: a group has no row to carry a refusal.
  "stack.selection.count": "{count} sélectionnées",
  "stack.selection.follow": "Suivre {count}",
  "stack.selection.clear": "vider",
  "stack.group.retired":
    "aucune suivie. l’une d’elles a quitté le catalogue, retirez-la donc de la sélection.",
  "stack.group.failed":
    "aucune suivie. le changement n’a pas atteint la base de données, réessayez.",
  // The Catalog column.
  "stack.catalog.byCategory": "ce que vous pourriez ajouter, par catégorie",
  "stack.catalog.byRelease": "ce que vous pourriez ajouter, par dernière release",
  "stack.catalog.intro": "chaque release ici est synthétisée une fois, pour tout le monde",
  "stack.catalog.layout": "Disposition du catalogue",
  "stack.catalog.selectMany": "sélectionner plusieurs",
  "stack.catalog.sortedBy": "trié par",
  "stack.catalog.sort.category": "catégorie",
  "stack.catalog.sort.release": "dernière release",
  "stack.catalog.category": "Catégorie",
  "stack.catalog.all": "toutes",
  "stack.catalog.find": "trouver une technologie",
  "stack.catalog.placeholder": "nom ou description",
  // The count says where it is counting, so a small total never reads as a small Catalog.
  "stack.catalog.match": "{shown} sur {total} correspondent",
  "stack.catalog.matchIn": "{shown} sur {total} correspondent dans {category}",
  "stack.catalog.total": {
    one: "{count} technologie",
    many: "{count} technologies",
    other: "{count} technologies",
  },
  "stack.catalog.totalIn": {
    one: "{count} technologie dans {category}",
    many: "{count} technologies dans {category}",
    other: "{count} technologies dans {category}",
  },
  "stack.catalog.shownOf": "{shown} sur {total}",
  "stack.catalog.keys": "appuyez sur / pour chercher, échap pour vider",
  "stack.catalog.latestFirst": "dernière release d’abord",
  "stack.catalog.latest": "dernière {version}",
  "stack.catalog.latestOn": "dernière {version} le {date}",
  "stack.catalog.noMatch": "aucune technologie ne correspond à « {query} »",
  "stack.catalog.curated":
    "Le catalogue est tenu à la main, et les demandes de nouvelles technologies ne sont pas encore ouvertes.",
  // The Version in use, declared on a Technology page and read by the Upgrade Path.
  "stack.version.form": "Version de {name} en usage",
  "stack.version.label": "en usage",
  "stack.version.field": "Version en usage",
  "stack.version.save": "Enregistrer",
  "stack.version.clear": "Vider",
  "stack.version.declared": "déclarée le {date}",
  "stack.version.none": "non déclarée",
  "stack.version.denied": "La version en usage n’a pas été enregistrée. Réessayez.",
} as const satisfies Partial<MessageDictionary>;
