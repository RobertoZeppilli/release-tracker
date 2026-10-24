// The landing, which is the one page written as prose rather than as labels: the argument, the four
// stages of the demonstration, the two thin specimens, the four Significance words defined, and the
// close. It is one namespace because it is one page, and because this is the list to read when
// asking whether the argument has been translated at all.
// What is **not** here is the product's grammar: `verdict:`, `warning:`, `help:`, `breaking[n]:`,
// `note:`, `release-notes:n` and the four Significance names are identical in every language
// (ADR 0008), so they stay literals in the components. The figures are not here either: they come
// from `SPECIMEN`, from the Catalog directory and from the Plan, so the sentences name them as gaps
// and no language can retype one wrong.
export const landing = {
  // The first screen. The claim is the page's display line and carries the full stop, which the
  // band titles under it do not: it is a sentence, they are headings.
  "landing.claim": "Understand before you upgrade.",
  // `{breaking}` is the counted phrase below, put in a `strong`, and `{propTypes}` is a `code`:
  // both are gaps a node goes in (`Filled`), so a language is free to move them.
  "landing.lede":
    "{name} {version} shipped {breaking} across {lines} lines of release notes. One of them makes {propTypes} do nothing, silently, and it is on line {line}.",
  "landing.promise":
    "Verdict follows the releases of the technologies in your stack and gives each one a single verdict: whether it asks something of you, what breaks, and how to migrate. Every claim points at the line of the release notes it was read from, so you can check it in one click instead of trusting it.",
  "landing.seeVerdict": "see the verdict for {name} {version}",
  // The one counted phrase of the page, and it is read in three places: the lede, the source stage
  // and the help stage. One key, so one language cannot say it three ways.
  "landing.breakingChanges": {
    one: "{count} breaking change",
    other: "{count} breaking changes",
  },

  // Proof Panel. `breaking` and `notable` are not here: they are the words the Release pages print
  // beside a version, so the panel says them in the same register the app does.
  "landing.panel.window": "lines {first} to {last} of {total}",
  "landing.panel.linesRead": "lines read",

  // The Bench, four stages in reading order. The stage names (`source`, `cite`, `verdict`, `help`)
  // are not here on purpose: each one is also the `id` the page is anchored by, so translating them
  // would move the anchors with the language, and `help:` is grammar in any case.
  "landing.bench.title": "One release, four stages",
  "landing.bench.sub":
    "The same release the first screen quotes, read the way the app reads it: what the project published, the line the verdict rests on, the verdict itself, and where it goes next.",
  "landing.bench.notesFrom": "notes from {source}, {lines} lines",
  "landing.bench.window": "lines {first} to {last}",
  "landing.bench.source":
    "{lines} lines, kept exactly as published and numbered so a claim can name one of them. The {breaking} are listed in a single section, and the first screen shows {window}.",
  "landing.bench.cite":
    "Nothing is paraphrased. The verdict quotes this line, points back at it, and would be wrong in a way you could see if the line said something else.",
  "landing.bench.verdictTitle": "propTypes stop being checked",
  "landing.bench.verdictBody":
    "A component that declares {propTypes} keeps compiling and keeps running. Nothing warns, and nothing is checked any more.",
  "landing.bench.help": "migrate to TypeScript props, or to another type-checking solution.",
  "landing.bench.helpAll":
    "All {breaking} are listed the same way on the release page, each with its own cited line and its own help line.",

  // Short Specimens, the honest half of the argument.
  "landing.thin.title": "And when the notes are not that kind",
  "landing.thin.sub":
    "Most releases do not publish {lines} lines. What Verdict does with the thin ones is the same discipline, which is why it is on this page and not in a FAQ.",
  "landing.thin.vite":
    "a changelog of {lines} lines, where the two breaking ones are marked by a single {bang} and sit between a {chore} and a {perf}. {link}",
  "landing.thin.viteLink": "read them apart",
  "landing.thin.typescript":
    "a release whose body is {blog}. There is nothing here to judge, so Verdict says exactly that and points at where the real notes live. {link}",
  "landing.thin.typescriptBlog": "a link to a blog post",
  "landing.thin.typescriptLink": "see that state",
  // The quotation marks are part of the sentence and not added by the component, so each language
  // uses its own pair.
  "landing.thin.note":
    "This is the sentence Verdict prints instead of a verdict when the notes only point elsewhere. “I found no breaking changes” and “there are no breaking changes” are different claims, and the second one is never printed in place of the first.",

  // Vocabulary Legend. The four definitions are GLOSSARY.md's own sentences (Rilevanza) in the
  // interface's language, and they live here rather than in the landing's domain because a
  // definition is copy: the domain keeps the four levels and their order.
  "landing.words.title": "Four words on every release",
  "landing.words.sub":
    "Significance is a shape beside the version, never a hue: colour on this product means severity and nothing else. A release is not urgent because it is red, it is urgent because its notes say so, on a line you can read.",
  "landing.words.featured":
    "The release where a technology changes direction: a new major where SemVer holds, a new minor for the projects that ship their real changes there. These open your dashboard, and they are the ones the page verdict counts.",
  "landing.words.notable":
    "New work, no change of direction: a new minor under SemVer, an odd-numbered Node major. Worth reading, rarely urgent.",
  "landing.words.digest":
    "What the rule treats as routine, patches first. They never interrupt: you read them grouped by ISO week, in one pass.",
  "landing.words.preview":
    "A beta or a release candidate. Only the first preview of a new major is summarized, and canaries, nightlies and alphas are not releases here at all.",

  // The close, and the counter-position beside it.
  "landing.close.claim": {
    one: "Follow the one technology that decides your week.",
    other: "Follow the {count} technologies that decide your week.",
  },
  "landing.close.plan":
    "The free plan follows up to {limit} technologies from a curated catalog of {size}. Sign-in is GitHub, and the release pages stay readable without it.",
  "landing.close.browse": {
    one: "browse the one technology",
    other: "browse all {count} technologies",
  },
  "landing.close.note.claim": "it does not open pull requests",
  "landing.close.note.body":
    "Dependabot and Renovate do that well, and they tell you a version moved. A newsletter tells you a release was interesting. Verdict answers the question those leave open: does this release ask something of me, and where does it say so. It reads only the release notes, it never guesses, and when the notes say nothing it says nothing.",

  // The foot of the page, under the rule: where the content came from, and the link that lets a
  // sceptical reader check the whole page against the source in one click.
  "landing.foot.read": "content read from public release notes",
  "landing.foot.notes": "{name} {version} notes",

  // The entry action, in its two faces. `Continue with GitHub` is the login page's own button
  // (`account.login.button`) and this is the landing's invitation, which is why the two differ.
  "landing.entry.visitor": "Sign in with GitHub",
  "landing.entry.developer": "Go to your dashboard",
} as const;
