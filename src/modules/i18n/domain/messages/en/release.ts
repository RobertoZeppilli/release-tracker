// The strings of a Release as the product talks *about* it: the verdict a row carries, the states a
// Summary can be in, and the frame of the Release page. What is on this page and is **not** here is
// the point of the product: the Release Notes and the Summary keep the language they were written in
// (ADR 0008).
// The prefixes (`warning:`, `ok:`, `note:`, `pending:`, `error:`, `breaking[n]:`) and the names of
// the Significance levels (`featured`, `notable`, `digest`, `preview`) are not here: they are the
// product's grammar, identical in every language.
export const release = {
  // Named in the language the sentence is written in, not through `LOCALE_NAMES`: a reader of
  // Italian is told `in inglese`, and `in English` is what `LOCALE_NAMES.en` would have given them.
  "release.originalLanguage":
    "the summary and the release notes are in English",
  "release.notes": "Release notes",
  // Where to look when a Release has no notes of its own. The lower-case one is a Help Pointer
  // label and not a button, so it declares itself the way every other link in the system does
  // (DESIGN.md, Help Pointer Link).
  "release.viewOn": "View on {where}",
  "release.viewOnLower": "view on {where}",
  "release.via": "via {source}",
  "release.digestCount": {
    one: "{count} digest release",
    other: "{count} digest releases",
  },
  "release.breakingIn": "Breaking changes in {label}",
  "release.readNotes": "read the release notes",
  "release.migrate": "migrate to {name} {version}",
  "release.none": "No releases recorded yet.",
  // What a row says about itself (`rowVerdict`), read on every surface a Release row appears on.
  // An action row carries the count of its breaking changes, after the `·` that separates two facts
  // on one line (DESIGN.md).
  "release.verdict.action": "action required",
  "release.verdict.actionCount": {
    one: "action required · {count} breaking change",
    other: "action required · {count} breaking changes",
  },
  "release.verdict.safe": "safe to upgrade",
  "release.verdict.unjudged": "not enough notes to judge",
  // The states of a Summary, each one a title the row and the status block both read: the same state
  // said in two words on a row and in a block on the page is one sentence, so it is one key.
  "release.status.queued": "summary queued",
  "release.status.processing": "summary in progress",
  "release.status.unavailable": "no release notes to summarize",
  "release.status.digest": "no summary for this digest release",
  "release.status.older": "no summary for this older release",
  "release.status.failed": "summary unavailable",
  "release.status.none": "no summary",
  "release.status.label": "Summary status",
  // The bodies of the status block. Dates are absolute because the page is cached: `today` would go
  // stale in it.
  "release.status.detected": "Detected {when}.",
  "release.status.imported": "Imported {when}.",
  "release.status.when": "{date} at {time} UTC",
  "release.status.queuedBody":
    "{recorded} Summaries usually land within a few hours; the full release notes are already below.",
  "release.status.unavailableBody":
    "The maintainers published this version without release notes, and we don't guess what changed.",
  // One more sentence where the Technology is on GitHub, added to the one above it rather than
  // written into it: a language is free to join the two the way it joins sentences.
  "release.status.unavailableGitHub": "The commit history on GitHub is the best source.",
  "release.status.digestBody":
    "Digest releases are listed without a summary. The original release notes for this version are below.",
  "release.status.olderBody":
    "We summarize recent releases. The original release notes for this version are below.",
  "release.status.failedBody":
    "We couldn't produce a reliable summary for this release. The original release notes are below.",
  // The folded source view of the notes, and the way back from a cited line to the diagnostic that
  // cited it (issue #85). `release-notes` itself is the panel's name and stays as it is written.
  "release.source.lines": {
    one: "{count} line",
    other: "{count} lines",
  },
  "release.source.back": "back to {label}",
} as const;
