// The terms, one namespace because it is one page. Every claim here is one the code makes true
// (issue #132), so a translation that softens one of them makes the page say something the app does
// not do: the sentences are deliberately flat, and a language should keep them flat.
// The follow limit is a gap and never a digit, because the Plan is what decides it.
export const terms = {
  "terms.lede":
    "What the service is, what it holds you to, and what it does not promise. It is short because the product is small, and nothing below describes something the app does not do.",

  "terms.service.title": "the service",
  "terms.service.body":
    "Verdict follows the releases of the technologies in its catalog and gives each one a verdict: whether it asks something of you, what breaks, and how to migrate. Release and technology pages are public and need no account. Following a technology, declaring the version you are on and the dashboard are yours alone, and those need one.",

  "terms.catalog.title": "the catalog is curated",
  "terms.catalog.body":
    "The catalog is chosen and maintained by us. There is no form to add a technology to it and no queue behind one: a technology enters when we can follow its releases properly, and it can be retired when we no longer can. A retired technology stays readable, and it stays yours if you were following it.",

  "terms.plan.title": "the plan",
  "terms.plan.body":
    "There is one plan, Free. It follows up to {limit} technologies and costs nothing. The app never asks for payment details, and there is nothing to cancel.",

  "terms.summaries.title": "the summaries are generated, and can be wrong",
  "terms.summaries.body":
    "Every summary is written by a language model that reads one thing: the release notes the project itself published for that release. It is given no other source, and no data about you.",
  "terms.summaries.check":
    "A model can misread. That is why a summary is not the last word on the page: its claims carry the line of the release notes they were read from, and the page links the notes at their source. The quote is there so you can check instead of trust. When a change is expensive to get wrong, read the cited line before you act on the verdict.",

  "terms.account.title": "your account",
  "terms.account.body":
    "You sign in with GitHub, which is asked for your public profile and your email address and nothing else: no access to any repository. You can delete the account at any time from the {account}, and deleting it takes the technologies you follow and the versions you declared with it. What is held, and by whom, is in the {privacy}.",

  "terms.conduct.title": "what we ask of you",
  "terms.conduct.body":
    "Read it, follow what you use, and leave the rest alone: no automated traffic beyond what a reader generates, no attempt to reach another account’s data, no attempt to break the app or the services behind it. An account doing any of those can be ended without notice.",

  "terms.warranty.title": "no warranty",
  "terms.warranty.body":
    "The service is provided as it is. It can change, it can be unavailable, and it can stop. The summaries can be wrong, the release notes they read can themselves be wrong or incomplete, and an upgrade is still your decision and your responsibility. Nothing here is advice, and no liability is accepted for what follows from an upgrade.",

  "terms.changes.title": "changes, and how to reach us",
  "terms.changes.body":
    "These terms can change. The date at the top of this page is the day its text last changed, and it is the only record of that there is. Questions, mistakes you spot, anything else: {mail}.",
} as const;
