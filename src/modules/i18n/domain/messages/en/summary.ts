// The strings of the Summary as it is read on a Release page: the verdict's claim, the Counts Panel
// and the two section titles. The **Summary itself is not here**: its title, its key points and its
// breaking changes are written by the model in English and stay in it (ADR 0008), which is the whole
// reason a Release page says out loud that it is mixed.
// `warning:`, `ok:`, `note:`, `breaking[n]:` and `help:` are not here either: they are the product's
// grammar, identical in every language and identical inside the Summaries themselves.
export const summary = {
  "summary.verdict.action": "action required",
  "summary.verdict.safe": "safe to upgrade",
  // `notesJudgeable` in GLOSSARY.md, whose own row carries this sentence: the seventh state, where
  // the notes point elsewhere instead of describing what changed.
  "summary.verdict.unjudged": "not enough notes to judge",
  "summary.unjudged.why":
    "These release notes point somewhere else instead of describing what changed, so neither verdict would be honest: we found no breaking changes, which is not the same as there being none. The notes are below, with the link they point to.",
  // The Counts Panel. The figure used to be a `strong` of its own inside the sentence, which a
  // message cannot carry (`message.ts`): the panel keeps its own ink and the figure is read in the
  // sentence, where `tabular-nums` still lines it up.
  "summary.counts.breaking": {
    one: "{count} breaking change",
    other: "{count} breaking changes",
  },
  "summary.counts.keyPoints": {
    one: "{count} key point",
    other: "{count} key points",
  },
  "summary.section.breaking": "breaking changes",
  "summary.section.keyPoints": "key points",
  "summary.section.allCited": "all cited, each with a fix",
  "summary.section.eachFixed": "each with a fix",
  // The provenance tail, one message and not four pieces joined with a separator: a language that
  // wanted the model before the source could not reorder a join.
  "summary.provenance":
    "summary · from the release notes only · {model} · prompt {version}",
} as const;
