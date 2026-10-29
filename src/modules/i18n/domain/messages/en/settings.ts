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
  // The two zone titles of the page (#194) carry a capital: at 18px in sans a lowercase word reads
  // as a mistake rather than as the product's grammar, which is the mono 13px labels under them.
  // `shell.language` stays lowercase and is not reused here: it also titles the picker in the foot.
  "settings.language.title": "Language",
  "settings.language.interface": "interface language",
  "settings.language.note":
    "The language is part of the address, so a page can be shared in the language it was read in. Release notes and summaries stay in their original language.",
  // The Notifications section (issue #171, ADR 0009). `featured`, `notable`, `Pro`, `slack` and the
  // bell's own words are the product's grammar and stay English in all five languages; the names of
  // the glossary are translated inside the sentences, as everywhere else (ADR 0008).
  "settings.notifications.title": "Notifications",
  "settings.notifications.intro":
    "Which releases reach you, and where. The bell is free for good; Slack is Pro.",
  "settings.notifications.bell.title": "the bell",
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
  "settings.notifications.pro": "Pro",
  // Not a plural: the trial is thirty days for everyone, and the figure is in the sentence so that
  // the number lives in one place in the code (`EXTERNAL_TRIAL_DAYS`) rather than in five languages.
  "settings.notifications.trial.start": "start the 30 day Pro trial",
  "settings.notifications.trial.note": "30 days, free. After them Slack needs Pro; the bell stays free.",
  "settings.notifications.trial.left": {
    one: "One day left of the Pro trial.",
    other: "{count} days left of the Pro trial.",
  },
  "settings.notifications.trial.ended": "The Pro trial has ended. Slack needs Pro; the bell stays free.",
  "settings.notifications.switch.slack": "{name} on Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.connect": "Add to Slack",
  "settings.notifications.slack.dialog.title": "Add Verdict to Slack",
  "settings.notifications.slack.dialog.asks": "Slack asks for a workspace and a channel.",
  "settings.notifications.slack.dialog.continue": "continue to Slack",
  "settings.notifications.slack.dialog.cancel": "cancel",
  "settings.notifications.slack.result.connected": "Slack is connected.",
  "settings.notifications.slack.result.cancelled": "Nothing changed: the authorisation was not given.",
  "settings.notifications.slack.result.failed":
    "Slack did not finish the authorisation, so nothing was saved. Try again.",
  "settings.notifications.slack.result.denied":
    "That return did not belong to an authorisation started here, so it was refused. Start again from this page.",
  "settings.notifications.slack.result.unavailable":
    "Add to Slack is not available here, so paste a webhook below instead.",
  "settings.notifications.slack.manual": "or paste a webhook yourself",
  "settings.notifications.slack.manualNote":
    "The other way in, and the only one in development: create an incoming webhook in your workspace, choose the channel, and paste the URL. It is a secret, so once it is saved you read back only where it points, never the URL itself.",
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
  "settings.notifications.locale.title": "language of slack",
  "settings.notifications.locale.note":
    "Slack has no address to read a language from, so it is written in this one. It does not change the language of the site, which stays the one in the address, and release notes and summaries stay in their original language.",
  "settings.notifications.locale.choose": "Write Slack in {name}",
  "settings.notifications.locale.error":
    "Not saved. The language is still the one marked here, which is the one the database holds: press it again.",
} as const;
