// The strings of the Upgrade Path: the panel with its two controls, the verdict with its rows, the
// stat rows beside the bars and the notes the form answers with. A namespace of its own and not part
// of `release`, because this is one half of the Technology page and the file would otherwise be the
// longest in the dictionary.
// ⚠️ `featured`, `notable`, `digest` and `previews` are the product's grammar and are not
// translated, here or anywhere (ADR 0008): they are the words that appear inside the Summaries.
export const path = {
  "path.title": "upgrade path",
  "path.latest": "latest",
  // The visible word of the field, and the accessible name that has to stand on its own wherever a
  // screen reader lists the fields of the page. The visible word is inside the name, as WCAG 2.5.3
  // asks, so a translation has to keep it inside it too.
  "path.from": "from",
  "path.from.name": "Upgrade from",
  "path.check": "Check",
  "path.whatToDo": "What to do",
  "path.changed.inOrder": "what has changed, in the order you upgrade",
  "path.changed.newest": "what has changed, newest major first",
  "path.previews.ahead": "ahead of {version}",
  "path.previews.upcoming": "upcoming",
  "path.legend.label": "Bar fills",
  "path.legend.action": "needs action",
  // The verdict of the path. `up to date` and `safe to upgrade` are two different answers: the
  // first is a path with nothing in it, the second a path with nothing in it that asks anything.
  "path.verdict.action": {
    one: "{count} needs action",
    other: "{count} need action",
  },
  "path.verdict.missing": "{count} without a verdict",
  "path.verdict.upToDate": "up to date",
  // One key for the two places that say it: the verdict line and the row of the panel under it.
  "path.safe": "safe to upgrade",
  // The sentence a path with nothing in it reads instead of the rows.
  "path.sentence.latest": "{from} is already the latest stable release.",
  "path.sentence.all": "Between {from} and {to} there {total}: {list}.",
  "path.sentence.total": {
    one: "is {count} release",
    other: "are {count} releases",
  },
  // The clauses of that sentence, joined by `path.list.last`. The comma between the others is
  // punctuation and stays in the code: every one of these five languages writes it the same way.
  "path.list.last": "{items} and {last}",
  "path.clause.action": {
    one: "{count} needs action",
    other: "{count} need action",
  },
  "path.clause.safe": {
    one: "{count} is safe to upgrade",
    other: "{count} are safe to upgrade",
  },
  "path.clause.noSummary": {
    one: "{count} has no summary yet (check its notes)",
    other: "{count} have no summary yet (check their notes)",
  },
  "path.clause.unjudged": {
    one: "{count} has notes too thin to judge",
    other: "{count} have notes too thin to judge",
  },
  "path.clause.digest": {
    one: "{count} is a digest fix you can skip",
    other: "{count} are digest fixes you can skip",
  },
  // The rows of the panel. The figure is printed in a column of its own, so none of these carries
  // `{count}`: the count is passed all the same, because it is what chooses the plural form.
  "path.row.total": {
    one: "release, {from} to {to}",
    other: "releases, {from} to {to}",
  },
  "path.row.action": {
    one: "needs action",
    other: "need action",
  },
  "path.row.noSummary": "no summary yet",
  "path.row.unjudged": "notes too thin to judge",
  "path.row.digest": {
    one: "digest fix you can skip",
    other: "digest fixes you can skip",
  },
  "path.showAll": {
    one: "show all {count} release",
    other: "show all {count} releases",
  },
  // The whole recorded history, which is what an emptied field asks for.
  "path.history.nothing": "nothing recorded yet.",
  "path.history.all": "the whole recorded history, {releases} in {majors}.",
  "path.history.allAndPreviews":
    "the whole recorded history, {releases} in {majors}, and {previews}.",
  "path.history.previewsOnly": "the whole recorded history, {previews}.",
  "path.history.label": "Recorded history",
  "path.history.back": "back to the upgrade path",
  "path.count.releases": {
    one: "{count} release",
    other: "{count} releases",
  },
  "path.count.majors": {
    one: "{count} major",
    other: "{count} majors",
  },
  "path.count.previews": {
    one: "{count} upcoming preview",
    other: "{count} upcoming previews",
  },
  // The stat row beside a bar. `missing` holds two different facts and neither may be printed as
  // the other: a Release with no Summary is not summarized, one whose notes could not be judged is
  // there to be checked.
  "path.kind.featured": "{count} featured",
  "path.kind.notable": "{count} notable",
  "path.kind.digest": "{count} digest",
  "path.missing.notSummarized": "{count} not summarized",
  "path.missing.toCheck": "{count} to check",
  "path.after": "after {version}",
  // The start the page chose on its own, named so the counts under it are not read as the answer to
  // a question the reader asked.
  "path.start.note":
    "starting from {version}, {which}, because no version was given.",
  "path.start.previousMajor": "the last release of the previous major",
  "path.start.oldest": "the oldest release recorded",
  // What the form answers with. `major.minor.patch` is the shape of a Version, not a word.
  "path.invalid.malformed":
    "{from} is not a version. Write it as major.minor.patch, for example {example}.",
  "path.invalid.empty": "An empty value",
  "path.invalid.notOlder": "{from} is newer than {latest}, the latest stable release.",
  "path.invalid.noStable":
    "There is no stable release yet, so there is no upgrade path.",
  "path.unrecorded.why":
    "{from} is not a recorded {name} release, so the path counts the recorded releases after it.",
  // Split from the links that follow it, because a message cannot carry an element (`message.ts`).
  "path.unrecorded.ask": "Did you mean",
  "path.or": "or",
} as const;
