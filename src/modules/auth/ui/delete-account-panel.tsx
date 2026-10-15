import { SeverityLabel, VERSION_BUTTON_CLASS, VERSION_INPUT_CLASS } from "@/modules/releases/ui";
import { cn } from "@/lib/utils";
import { DELETION_WORD } from "../domain/account-deletion";

export type DeletionError = "confirm" | "failed";

const MESSAGES: Record<DeletionError, string> = {
  confirm: `that is not the word. Nothing was deleted: type ${DELETION_WORD} to confirm.`,
  failed: "the deletion did not go through, and nothing was deleted. Try again in a moment.",
};

const FIELD_ID = "confirm";
const NOTE_ID = "confirm-note";

// The same field and button as the version controls, at this field's own width: one control drawn
// twice would be two that look nearly alike (DESIGN.md, Version in Use).
const FIELD_CLASS = cn(VERSION_INPUT_CLASS, "w-[14ch] stacked:w-[14ch]");

// ⚠️ **No confirm dialog and no disabled button.** A native dialog is forbidden in this project, and
// a button that is dead until a field is right has to explain itself twice, once to the eye and once
// to a screen reader. The word is the whole guard, and it is checked where it counts, on the server
// (`/auth/delete-account`): a form can be posted without the page, so a check that lived in the
// browser would be decoration.
//
// A plain form, so it works with JavaScript off: the page is behind the login and already dynamic,
// and a deletion is the last thing that should need a script to go through.
export function DeleteAccountPanel({
  followed,
  declared,
  error,
  revokeUrl,
}: {
  followed: number;
  declared: number;
  error: DeletionError | null;
  // Built by `githubRevokeUrl`, and passed in rather than read here: a component does not read the
  // environment.
  revokeUrl: string;
}) {
  return (
    <section aria-labelledby="delete-account" className="mt-8 border-t border-rule pt-6">
      <h2 id="delete-account" className="font-mono text-section-title text-text">
        delete this account
      </h2>
      <p className="mt-3 max-w-prose font-sans text-body text-text-muted">
        It goes at once and it cannot be undone. There is no copy to restore it from and no window to
        change your mind in.
      </p>
      <ul className="mt-4 max-w-measure font-mono text-meta text-text-faint">
        {[
          "the account itself, and the email address and GitHub name and picture that came with it",
          followed === 1 ? "1 followed technology" : `${followed} followed technologies`,
          declared === 1 ? "1 declared version in use" : `${declared} declared versions in use`,
          "the plan the account is on",
          "the session in this browser",
        ].map((line) => (
          <li key={line} className="flex gap-2 border-t border-rule py-2 first:border-t-0 first:pt-0">
            <span aria-hidden className="text-text-faint">
              -
            </span>
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-prose font-sans text-body text-text-muted">
        {/* The prose flows on from the label here, where every other `note:` in the app keeps its
            message in one `inline-block`: those are one short claim that must not break away from
            the label, this is three lines, and holding them together only pushed the whole of it
            onto a line of its own. */}
        <SeverityLabel tone="muted" label="note:" /> Signing in again afterwards makes a new account
        with nothing in it, not the old one back. GitHub keeps its own record of the authorisation
        you gave, and it is the one thing this button cannot reach:{" "}
        {/* No `target="_blank"`: every external link in this app opens in the same tab (the
            release-notes links do), and a reader who has not typed the word yet loses nothing by
            coming back with the browser. */}
        <a href={revokeUrl} className="text-link">
          revoke it on GitHub
        </a>
        .
      </p>
      <form action="/auth/delete-account" method="post" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor={FIELD_ID} className="font-mono text-diagnostic text-text-muted">
          type <span className="text-text">{DELETION_WORD}</span> to confirm
        </label>
        <input
          id={FIELD_ID}
          name="confirm"
          type="text"
          required
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error === "confirm" ? true : undefined}
          aria-describedby={error ? NOTE_ID : undefined}
          className={FIELD_CLASS}
        />
        <button type="submit" className={VERSION_BUTTON_CLASS}>
          Delete account
        </button>
      </form>
      {error && (
        <p id={NOTE_ID} role="alert" className="mt-3 max-w-measure font-mono text-diagnostic text-breaking">
          <SeverityLabel tone="breaking" label="error:" /> <span className="inline-block">{MESSAGES[error]}</span>
        </p>
      )}
    </section>
  );
}
