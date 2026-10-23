// The privacy notice, one namespace because it is one page. The six rows of `what is held` are the
// database read row by row (issue #132), so each one is a label and a reason and both are
// translated: a row added to the tables is added here, in every language, or the dictionary test
// fails. The names of the providers (GitHub, Supabase, Vercel, Anthropic) are not here: they are
// names, and they stay in the component beside the prose that describes them.
export const privacy = {
  "privacy.lede":
    "The whole of what this product knows about you, written from the tables it is kept in. It is a short list, and the shortest part of it is the one that matters most: nothing about you is ever sent to a language model.",

  "privacy.held.title": "what is held",
  "privacy.held.intro":
    "Nine things, and they all arrive either from the GitHub sign-in or from something you did in the app. There is no profile to fill in, no name beyond the one GitHub publishes, and no field that asks you anything else.",
  "privacy.held.id.label": "account id",
  "privacy.held.id.why": "the identifier the sign-in creates, which every row below is keyed by",
  "privacy.held.email.label": "email address",
  "privacy.held.email.why": "from GitHub, so the account can be recognised and reached",
  "privacy.held.github.label": "github name and picture",
  "privacy.held.github.why": "from GitHub, shown in the top bar and nowhere else",
  "privacy.held.follows.label": "technologies followed",
  "privacy.held.follows.why": "which ones, and the day each was followed",
  "privacy.held.versions.label": "versions declared",
  "privacy.held.versions.why": "the version you say you are on, and the day you said it",
  "privacy.held.plan.label": "plan",
  "privacy.held.plan.why": "Free, for every account",
  // The three rows the Notifications brought (ADR 0009, issue #171). The retention is said in
  // `privacy.keep.notifications`, which is the one row with a clock of its own.
  "privacy.held.notifications.label": "notifications",
  "privacy.held.notifications.why":
    "which release you were told about, the day it was written, and whether you have seen it",
  "privacy.held.channels.label": "notification channels",
  "privacy.held.channels.why":
    "which events reach you on which channel, and the slack address you give it, if you give it one",
  "privacy.held.sendLocale.label": "language of email and slack",
  "privacy.held.sendLocale.why": "the language those two are written in, which you set in the settings",
  "privacy.held.yours": "You can read your own copy of that list, filled in with your rows, on the {account}.",

  "privacy.prompt.title": "no personal data enters a prompt",
  "privacy.prompt.body":
    "The summaries are written by a language model, and the model is never told who you are. The job that writes them runs on the server, on a schedule of its own, and reads one thing: the release notes a project published. It does not know which technologies anyone follows, and a summary is the same text for every reader, written once and stored.",
  "privacy.prompt.images":
    "The browser never talks to a third party either. The GitHub picture is served through our own image optimizer, so your browser asks this site for it rather than asking GitHub.",

  "privacy.who.title": "who else touches it",
  "privacy.who.github":
    "authenticates the sign-in and hands over your public profile and email address. It has no access to this app’s data, and this app has no access to your repositories.",
  "privacy.who.supabase": "runs the database and the sessions: the nine rows above live there.",
  "privacy.who.vercel":
    "hosts the app, so it serves every request and keeps the request logs that come with doing so, and it counts page views through Vercel Analytics.",
  "privacy.who.anthropic":
    "provides the model that writes the summaries, from public release notes alone, as above.",

  "privacy.cookies.title": "cookies, and what is in your browser",
  "privacy.cookies.body":
    "There is no consent banner on this site because there is nothing to consent to: no advertising, no profiling, and no third party setting anything in your browser.",
  "privacy.cookies.what":
    "Signing in sets session cookies, which are what keeps you signed in from one page to the next; signing out or deleting the account clears them. The theme you pick is kept in your browser’s local storage, not in a cookie, and never leaves the browser. Vercel Analytics counts page views without a cookie and without storing an identifier in your browser: what it produces is counts of pages, not a trail of a person.",

  "privacy.keep.title": "how long, and how to end it",
  "privacy.keep.body":
    "Everything above is kept while the account exists. Deleting the account on the {account} removes it at once: the account row goes, and the follows, the declared versions and the plan go with it, because they are keyed to it and deleted with it. There is no grace period, no archive of ours, and nothing to undo it with.",
  "privacy.keep.notifications":
    "The notifications are the one row with a clock of its own: each is deleted 90 days after it was written, seen or not, and nothing of it is kept after that.",
  "privacy.keep.after":
    "What stays after that is outside the account: the catalog, the releases and the summaries, none of which were ever yours or about you. The providers above run their own backups and logs on their own schedules, which we neither control nor can delete from.",

  "privacy.reach.title": "how to reach us",
  "privacy.reach.body":
    "One address, answered by the person who runs this: {mail}. Ask what is held about you, ask for it to be deleted, or tell us something here is wrong.",
} as const;
