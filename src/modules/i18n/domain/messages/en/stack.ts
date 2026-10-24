// The strings of what a Developer follows: the Stack column, the Catalog column beside it, the
// Follow and its refusals, the quota, and the Version in use. One namespace for the two columns,
// because they are the two halves of one page (`/technologies`) and a reader of this file is asking
// the same question about both.
// ⚠️ The Categories (`language`, `framework`, `build tool`, …) and the two layouts (`rows`, `grid`)
// are **values**, not words: they are written in the address and in the stored preference, and
// GLOSSARY.md's "Codice / UI" column is the truth for them, so they stay as they are in every
// language (ADR 0008).
export const stack = {
  "stack.title": "what you follow, by name",
  "stack.figure.followed": "followed",
  "stack.figure.left": "left on your free plan",
  "stack.seeDashboard": "see them on your dashboard",
  "stack.empty": "nothing yet. follow something from the catalog and it lands here.",
  "stack.retired.title": "retired, still yours",
  "stack.retired.note":
    "no longer in the catalog and getting no new releases. Past releases stay readable, they still count toward your {limit}, and once let go they can't be followed again.",
  "stack.row.lastVersion": "last {version}",
  "stack.row.gone": "let go, for good",
  "stack.row.unfollow": "unfollow",
  "stack.unfollowed": "unfollowed · can't be followed again",
  // The Follow, in its two states. The label says what a press does next, and the accessible name
  // names the Technology, because a page carries many of these buttons (WCAG 2.5.3).
  "stack.follow": "Follow",
  "stack.following": "Following",
  "stack.followName": "Follow {name}",
  "stack.unfollowName": "Unfollow {name}",
  "stack.selectName": "Select {name}",
  // The quota, which the Dashboard prints too: one sentence, so one key, wherever it is read.
  "stack.quota.label": "Followed technologies",
  "stack.quota.short": "{count} followed",
  "stack.quota.followed": "{count} of {limit} followed",
  "stack.quota.swap": "unfollow one to follow another",
  "stack.limit.full":
    "your free plan is full. let one go in what you follow to follow another.",
  // What the database refused, and the way out, which is the Developer's own in all three.
  "stack.rejected.limit":
    "not followed. your free plan filled up in another session, so let one go to follow another.",
  "stack.rejected.retired":
    "not followed · it has left the catalog · a retired technology can't be followed again",
  "stack.rejected.failed": "not saved · the change didn't reach the database · try again",
  // A group Follow. The wall is named before the press and inked only once the database says so.
  "stack.selection.count": "{count} selected",
  "stack.selection.follow": "Follow {count}",
  "stack.selection.clear": "clear",
  "stack.wall.full": {
    one: "your free plan is full, and {count} is selected.",
    other: "your free plan is full, and {count} are selected.",
  },
  "stack.wall.room": {
    one: "your free plan has room for {room} more, and {count} is selected.",
    other: "your free plan has room for {room} more, and {count} are selected.",
  },
  "stack.group.limit": "none followed. {wall}",
  "stack.group.retired":
    "none followed. one of them has left the catalog, so clear it from the selection.",
  "stack.group.failed":
    "none followed. the change didn't reach the database, so try again.",
  // The Catalog column.
  "stack.catalog.byCategory": "what you could add, by category",
  "stack.catalog.byRelease": "what you could add, by latest release",
  "stack.catalog.intro": "each release here is summarized once, for everyone",
  "stack.catalog.layout": "Catalog layout",
  "stack.catalog.selectMany": "select many",
  "stack.catalog.sortedBy": "sorted by",
  "stack.catalog.sort.category": "category",
  "stack.catalog.sort.release": "latest release",
  "stack.catalog.category": "Category",
  "stack.catalog.all": "all",
  "stack.catalog.find": "find a technology",
  "stack.catalog.placeholder": "name or description",
  // The count says where it is counting, so a small total never reads as a small Catalog. Four keys
  // and not one with a clause glued on: `in {category}` is a fragment, and a fragment is what a
  // translation cannot move inside its own sentence.
  "stack.catalog.match": "{shown} of {total} match",
  "stack.catalog.matchIn": "{shown} of {total} match in {category}",
  "stack.catalog.total": {
    one: "{count} technology",
    other: "{count} technologies",
  },
  "stack.catalog.totalIn": {
    one: "{count} technology in {category}",
    other: "{count} technologies in {category}",
  },
  "stack.catalog.shownOf": "{shown} of {total}",
  "stack.catalog.keys": "press / to find, esc to clear",
  "stack.catalog.latestFirst": "latest release first",
  "stack.catalog.latest": "latest {version}",
  "stack.catalog.latestOn": "latest {version} on {date}",
  "stack.catalog.noMatch": "no technology matches “{query}”",
  "stack.catalog.curated":
    "The catalog is curated, and requests for new technologies aren't open yet.",
  // The Version in use, declared on a Technology page and read by the Upgrade Path.
  "stack.version.form": "Version of {name} in use",
  "stack.version.label": "in use",
  "stack.version.field": "Version in use",
  "stack.version.save": "Save",
  "stack.version.clear": "Clear",
  "stack.version.declared": "declared {date}",
  "stack.version.none": "not declared",
  "stack.version.denied": "The version in use was not saved. Try again.",
} as const;
