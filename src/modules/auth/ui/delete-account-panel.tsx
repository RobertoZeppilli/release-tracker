import type { Translator } from "@/modules/i18n";
import { Filled } from "@/modules/i18n/ui";
import { SeverityLabel, VERSION_BUTTON_CLASS, VERSION_INPUT_CLASS } from "@/modules/releases/ui";
import { cn } from "@/lib/utils";
import { DELETION_WORD } from "../domain/account-deletion";

export type DeletionError = "confirm" | "failed";

const MESSAGES: Record<DeletionError, "account.delete.error.confirm" | "account.delete.error.failed"> = {
  confirm: "account.delete.error.confirm",
  failed: "account.delete.error.failed",
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
  t,
}: {
  followed: number;
  declared: number;
  error: DeletionError | null;
  // Built by `githubRevokeUrl`, and passed in rather than read here: a component does not read the
  // environment.
  revokeUrl: string;
  // A prop and not `getTranslator()`: this file is exported from the module's `ui` index, which
  // client components import too.
  t: Translator;
}) {
  return (
    <section aria-labelledby="delete-account" className="mt-8 border-t border-rule pt-6">
      <h2 id="delete-account" className="font-mono text-section-title text-text">
        {t("account.delete.title")}
      </h2>
      <p className="mt-3 max-w-prose font-sans text-body text-text-muted">{t("account.delete.intro")}</p>
      <ul className="mt-4 max-w-measure font-mono text-meta text-text-faint">
        {[
          t("account.delete.item.account"),
          t("account.delete.item.follows", { count: followed }),
          t("account.delete.item.declared", { count: declared }),
          t("account.delete.item.plan"),
          t("account.delete.item.session"),
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
        <SeverityLabel tone="muted" label="note:" />{" "}
        {/* No `target="_blank"`: every external link in this app opens in the same tab (the
            release-notes links do), and a reader who has not typed the word yet loses nothing by
            coming back with the browser. */}
        <Filled
          text={t("account.delete.note")}
          nodes={{
            revoke: (
              <a href={revokeUrl} className="text-link">
                {t("account.delete.revoke")}
              </a>
            ),
          }}
        />
      </p>
      <form action="/auth/delete-account" method="post" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor={FIELD_ID} className="font-mono text-diagnostic text-text-muted">
          {/* The word kept its own ink by being an element inside the sentence, which a message
              cannot be (ADR 0008): the label reads in one ink now. */}
          {t("account.delete.confirm", { word: DELETION_WORD })}
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
          {t("account.delete.button")}
        </button>
      </form>
      {error && (
        <p id={NOTE_ID} role="alert" className="mt-3 max-w-measure font-mono text-diagnostic text-breaking">
          <SeverityLabel tone="breaking" label="error:" /> <span className="inline-block">{t(MESSAGES[error], { word: DELETION_WORD })}</span>
        </p>
      )}
    </section>
  );
}
