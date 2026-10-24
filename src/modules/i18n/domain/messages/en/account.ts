// The strings of the account: what it is made of, the way in (`/login`) and the way out of it
// (`delete account`, GLOSSARY.md). One namespace for the two pages, because signing in and ending an
// account are the two ends of the same thing, and a reader of this file is asking about both.
export const account = {
  "account.intro":
    "Everything this account is made of, and the way out of it. Nothing here is shared with anyone, and nothing on the public release and technology pages depends on it.",
  "account.held.signedIn": "signed in as",
  "account.held.noEmail": "no email address",
  "account.held.handle": "github name",
  "account.held.none": "none",
  "account.held.plan": "plan",
  "account.held.followed": "followed",
  "account.held.quota": "{count} of {limit}",
  "account.held.declared": "versions declared",
  // The deletion. It says what goes, by counting what is really there, so the list cannot drift
  // from the database the way a written one would (issue #132).
  "account.delete.title": "delete this account",
  "account.delete.intro":
    "It goes at once and it cannot be undone. There is no copy to restore it from and no window to change your mind in.",
  "account.delete.item.account":
    "the account itself, and the email address and GitHub name and picture that came with it",
  "account.delete.item.follows": {
    one: "{count} followed technology",
    other: "{count} followed technologies",
  },
  "account.delete.item.declared": {
    one: "{count} declared version in use",
    other: "{count} declared versions in use",
  },
  "account.delete.item.plan": "the plan the account is on",
  "account.delete.item.session": "the session in this browser",
  // `{revoke}` is a gap a link is put in (`Filled`), not a word: GitHub keeps its own record of the
  // authorisation, and it is the one thing this button cannot reach.
  "account.delete.note":
    "Signing in again afterwards makes a new account with nothing in it, not the old one back. GitHub keeps its own record of the authorisation you gave, and it is the one thing this button cannot reach: {revoke}.",
  "account.delete.revoke": "revoke it on GitHub",
  // `{word}` is the word that has to be typed, which is a constant of the product and not a
  // translation (`DELETION_WORD`).
  "account.delete.confirm": "type {word} to confirm",
  "account.delete.button": "Delete account",
  "account.delete.error.confirm":
    "that is not the word. Nothing was deleted: type {word} to confirm.",
  "account.delete.error.failed":
    "the deletion did not go through, and nothing was deleted. Try again in a moment.",
  // The way in. Lower case openings: the message is the claim after the `error:` label, not a
  // sentence on its own (DESIGN.md, The Severity Pairing Rule).
  "account.login.intro":
    "Following technologies and the dashboard are yours alone, so they need an account. Release and technology pages stay public and need no sign in.",
  "account.login.deleted":
    "that account is gone, with the technologies it followed and the versions it declared. Signing in makes a new one.",
  "account.login.terms":
    "Signing in accepts the {terms}. The {privacy} says what is kept, and the account page deletes all of it.",
  "account.login.terms.link": "terms",
  "account.login.privacy.link": "privacy notice",
  "account.login.button": "Continue with GitHub",
  "account.login.scope":
    "Asks GitHub only for your public profile and email address. No access to any repository.",
  "account.login.dev": "Continue as local developer",
  "account.login.devNote":
    "Local development only: this way in does not exist in production.",
  "account.login.error.denied": "the sign in was cancelled. Nothing changed.",
  "account.login.error.exchange": "that sign in link is no longer valid. Try again.",
  "account.login.error.provider":
    "GitHub is unreachable right now. Try again in a moment.",
  "account.login.error.dev":
    "the local developer could not sign in. Run `pnpm dev:login` and try again.",
} as const;
