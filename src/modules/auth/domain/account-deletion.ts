// The word a Developer types to delete their account. A deletion cannot be undone and the database
// cascades it (`follows` and `plans` reference `auth.users (id) on delete cascade`), so the page
// asks for a word rather than for a click: a confirm dialog is out of the question here (no native
// dialog in this app) and a lone button is one misplaced press away from a deletion nobody meant.

export const DELETION_WORD = "delete";

// Typed in the field, not read from a URL, so the comparison forgives what a keyboard does on its
// own: the surrounding space a paste carries, and the capital an autocapitalising phone adds to the
// first letter of an empty field. It forgives nothing else, which is the point of asking.
export function confirmsDeletion(typed: string | null | undefined): boolean {
  return typeof typed === "string" && typed.trim().toLowerCase() === DELETION_WORD;
}

// Where GitHub revokes the authorisation the sign-in asked for. Deleting the account here cannot
// reach it: the authorisation is a record GitHub keeps, on GitHub's side, and nothing this app holds
// can withdraw it. So the page says so and hands over the shortest link it can build.
//
// With the client ID it is the page of this app, which carries `Revoke access` itself; without it,
// the list of authorised applications, one click further and just as true. Both are addresses of
// github.com and neither is a call: no page of this app talks to GitHub from the browser (CLAUDE.md).
const AUTHORISED_APPS = "https://github.com/settings/applications";

export function githubRevokeUrl(clientId: string | undefined): string {
  return clientId ? `https://github.com/settings/connections/applications/${encodeURIComponent(clientId)}` : AUTHORISED_APPS;
}
