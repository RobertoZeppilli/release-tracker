// The strings of the Settings page: the one place a signed-in reader changes how the app behaves for
// them. Today it holds the language and nothing else, and it exists as a page rather than as a row of
// the account panel because the next preference will land beside the language instead of making that
// panel taller (decided with the user on 2026-10-16).
export const settings = {
  "settings.title": "Settings",
  "settings.intro":
    "How the app reads for you. Nothing here is shared with anyone, and nothing on the public release and technology pages depends on it.",
  // The language is chosen by following a link, not by saving a form: the language is in the address
  // (ADR 0008), so the choice is the page it leads to.
  "settings.language.note":
    "The language is part of the address, so a page can be shared in the language it was read in. Release notes and summaries stay in their original language.",
  // The Notifications section (issue #171, ADR 0009). `featured`, `notable`, `Pro`, `slack` and the
  // bell's own words are the product's grammar and stay English in all five languages; the names of
  // the glossary are translated inside the sentences, as everywhere else (ADR 0008).
  "settings.notifications.title": "notifications",
  "settings.notifications.intro":
    "Which releases reach you, and where. The bell is free for good; Slack and email are Pro.",
  "settings.notifications.featured.label": "featured releases",
  "settings.notifications.featured.off":
    "Switched off, a featured release of a technology you follow writes no notification at all: nothing on the bell, and nothing on a channel added later.",
  "settings.notifications.notable.label": "notable releases",
  "settings.notifications.notable.off":
    "Switched off, a notable release writes no notification. The featured ones are a switch of their own, so the releases worth interrupting you for can stay on while these go quiet.",
  // The accessible name of a switch: what it controls, since the state is `aria-checked` and saying
  // it in the name too would have a screen reader read it twice.
  "settings.notifications.switch": "{name} on the bell",
  "settings.notifications.error":
    "Not saved. The switch is back the way the database holds it, so what you see is what you have: press it again.",
  "settings.notifications.digest":
    "The weekly digest brings its own switch, on the day the digest itself arrives.",
  "settings.notifications.external.title": "slack and email",
  "settings.notifications.external.body":
    "Slack is here, with switches of its own below; the email is still being built and brings its own when it arrives. They carry the Pro mark from the first day, trial included: when the trial ends without Pro they switch off, and nothing is kept running out of habit. The bell stays, free.",
  "settings.notifications.pro": "Pro",
  // Not a plural: the trial is thirty days for everyone, and the figure is in the sentence so that
  // the number lives in one place in the code (`EXTERNAL_TRIAL_DAYS`) rather than in five languages.
  "settings.notifications.trial.waiting":
    "Your {count} day trial of Slack and email starts the first time you switch one of them on, not on the day you signed up.",
  "settings.notifications.trial.left": {
    one: "One day left of your trial of Slack and email.",
    other: "{count} days left of your trial of Slack and email.",
  },
  "settings.notifications.trial.ended":
    "Your trial of Slack and email has ended. The bell is free for good; the two external channels need Pro.",
  "settings.notifications.switch.slack": "{name} on Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.note":
    "Slack takes an incoming webhook: create one in your workspace, choose the channel, and paste the URL here. It is a secret, so once it is saved you read back only where it points, never the URL itself.",
  "settings.notifications.slack.label": "incoming webhook URL",
  "settings.notifications.slack.save": "save",
  "settings.notifications.slack.remove": "remove",
  "settings.notifications.slack.current": "Sending to {hint}. Leave the field empty and save to remove it.",
  "settings.notifications.slack.none": "No webhook yet, so the two switches below send nothing.",
  "settings.notifications.slack.invalid":
    "Not saved. A webhook URL starts with https://hooks.slack.com/services/ and comes from your own workspace.",
  "settings.notifications.slack.featured.off":
    "Switched off, featured releases still reach the bell and stop reaching Slack.",
  "settings.notifications.slack.notable.off":
    "Switched off, notable releases stop reaching Slack. The featured ones are a switch of their own, so they can keep arriving.",
  "settings.notifications.slack.grouping":
    "One message per run, with a line per release: ten releases in a run arrive as one message, not ten.",
  "settings.notifications.slack.test": "send a test message",
  "settings.notifications.slack.testOk": "The test message went out. The channel works.",
  "settings.notifications.slack.testFailed": "Slack did not take it: {error}",
  "settings.notifications.slack.testEmpty": "Nothing to test yet: save a webhook first.",
  "settings.notifications.locale.title": "language of email and slack",
  "settings.notifications.locale.note":
    "Email and Slack have no address to read a language from, so they are written in this one. It does not change the language of the site, which stays the one in the address, and release notes and summaries stay in their original language.",
  "settings.notifications.locale.choose": "Write email and Slack in {name}",
  "settings.notifications.locale.error":
    "Not saved. The language is still the one marked here, which is the one the database holds: press it again.",
} as const;
