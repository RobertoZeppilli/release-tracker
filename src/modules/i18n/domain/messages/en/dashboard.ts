// The strings of the Dashboard: the page verdict, the Standing column with its panel and its rows,
// the Stream and the Weekly Digest. The prefixes the verdicts wear (`ok:`, `warning:`, `note:`) are
// not here: they are the product's grammar and stay as they are in every language (ADR 0008), and
// so does `digest`, which is the name of a Significance.
export const dashboard = {
  // One key for one sentence, read in two places: the page verdict says it of the whole stack and a
  // Standing Row says it of one Technology. Two keys with the same words would be two places to
  // translate it, and the second is the one that gets forgotten.
  "dashboard.needsAction": {
    one: "{count} needs action",
    other: "{count} need action",
  },
  "dashboard.verdict.ok": "nothing needs action",
  // The short form of `nothing here can be judged yet`, and short on purpose: at Column verdict
  // scale the long one measures 516px inside a 360px column, and the rule is that the copy gives
  // way, not the scale and not the one line (DESIGN.md, The One-Line Verdict Rule). ⚠️ A
  // translation that runs long breaks that rule, so this is a key to read at 360px.
  "dashboard.verdict.none": "nothing judged yet",
  "dashboard.standing.noVersion": "no version declared",
  "dashboard.standing.upToDate": "up to date",
  // The Distance from the version the reader declared, named with it: `3 behind 18.2.0`.
  "dashboard.standing.behind": {
    one: "{count} behind {declared}",
    other: "{count} behind {declared}",
  },
  "dashboard.standing.list": "Followed technologies, by distance",
  "dashboard.totals.empty":
    "no version declared yet. declare one on a technology page and the totals land here.",
  "dashboard.totals.behind": "releases behind in all",
  "dashboard.totals.missing": "without a verdict",
  "dashboard.totals.since": "oldest version declared",
  "dashboard.barNote":
    "the bar is the distance from the version you declared, not a score",
  "dashboard.quota.followed": "{count} of {limit} followed",
  "dashboard.quota.swap": "unfollow one to follow another",
  "dashboard.stream.title": "what happened · last {days} days",
  // The count is a second span after the title, which is why the comma is inside the message: in
  // another language the figure may not follow the title the way it does here.
  "dashboard.stream.count": {
    one: ", {count} release",
    other: ", {count} releases",
  },
  "dashboard.stream.thisWeek": "this week",
  "dashboard.stream.window":
    "window: last {days} days, {start} to {end} UTC",
  "dashboard.stream.declaration": "you are on {version}",
  "dashboard.stream.migrate": "migrate to {name} {version}",
  // A day of a week's span, which is where the order of the two words is a question of language:
  // `Dec 2` in English, `2 dic` in Italian. The month comes from `Intl`, so no language lists its
  // own months here.
  "dashboard.week.day": "{month} {day}",
  "dashboard.week.range": "{start} to {end}",
  "dashboard.week.number": "week {week}",
  // One week folded is named with the Stream's own `week {n}`, not with a key of its own: it is the
  // same sentence, and two keys with one sentence are two places to translate it.
  "dashboard.digest.span.many": "weeks {from} to {to}",
  "dashboard.digest.claim": {
    one: "{count} more release, not asking anything",
    other: "{count} more releases, none asking anything",
  },
  "dashboard.digest.count": {
    one: "{count} digest release",
    other: "{count} digest releases",
  },
  "dashboard.digest.noAction": "no action needed",
  "dashboard.empty.none": "you follow no technologies yet",
  "dashboard.empty.some": {
    one: "you follow {count} technology",
    other: "you follow {count} technologies",
  },
  "dashboard.empty.what":
    "Follow the tools in your stack. This page then shows, for each one, the releases that matter from the last {days} days and whether upgrading needs action. The Free plan follows up to {limit}.",
  "dashboard.empty.open": "Open dashboard",
  "dashboard.empty.catalog": "in the catalog ({count})",
  "dashboard.empty.browse": {
    one: "browse all {count} technology",
    other: "browse all {count} technologies",
  },
} as const;
