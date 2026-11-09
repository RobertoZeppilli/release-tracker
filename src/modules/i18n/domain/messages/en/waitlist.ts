// The Waitlist (ADR 0010): the block on the landing, the field, its four answers, and the closed
// door of the login page. `{day}` is the launch day written out in the reader's language, which
// `launchDay` formats: no language retypes the date, so no language can get it wrong.
export const waitlist = {
  "waitlist.claim": "Verdict opens on {day}.",
  "waitlist.body":
    "The catalog, the summaries and every technology page are already here to read. What is not open yet is the account: follows, the dashboard and the notifications land on the day of the launch. Leave an address and you will hear from us once, that morning.",
  "waitlist.label": "your email",
  "waitlist.join": "keep me posted",
  // What the reader is promised, and it is the whole of it: one message, no list, no sharing.
  "waitlist.promise":
    "One message, on the day of the launch, and nothing else. No newsletter, and the address goes to nobody.",
  "waitlist.joined": "you are on the list. one message, on {day}.",
  "waitlist.already": "that address is already on the list. nothing else to do.",
  "waitlist.invalid": "that does not look like an email address.",
  "waitlist.failed": "that did not go through. try again in a minute.",
  // The label of the trap field, off screen and out of the accessibility tree: it exists because a
  // field without a label is a field a robot can tell apart from the real one.
  "waitlist.trap": "leave this field empty",

  // The closed door of `/login`, where somebody arrives who has no account yet. The claim over it
  // is `waitlist.claim`, the same sentence the landing says: one sentence is one key.
  "waitlist.door.body":
    "Accounts open on the day of the launch, so there is nothing to sign up to yet. Leave your address on the home page and you will hear from us that morning.",
  "waitlist.door.leaveEmail": "leave your email on the home page",
  "waitlist.door.existing": "Already have an account? Signing in works as it always did.",
  // What the callback says when it turned somebody away: it follows a `note:` label, so it
  // starts lower case (DESIGN.md, The Severity Pairing Rule).
  "waitlist.door.refused":
    "we are not open yet, so no account was created. leave your address and you will hear from us on the day.",
} as const;
