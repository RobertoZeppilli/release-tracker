"use client";

import { useActionState } from "react";
import { useLocale, useTranslator } from "@/modules/i18n/ui";
import { SeverityLabel, VERSION_BUTTON_CLASS, VERSION_INPUT_CLASS } from "@/modules/releases/ui";
import { MAX_EMAIL } from "../domain/email";
import { EMAIL_FIELD, type Joined, type JoinWaitlist, LOCALE_FIELD, TRAP_FIELD } from "../domain/joining";

const FIELD_ID = "waitlist-email";
const NOTE_ID = "waitlist-note";
const TRAP_ID = "waitlist-email-confirm";

// An address is not a version, so the field takes the width of the measure instead of 11ch; the
// control itself is the project's one input and one button, unchanged.
const FIELD = `${VERSION_INPUT_CLASS} w-full max-w-[34ch] stacked:w-full`;

// The field of the Waitlist (ADR 0010), and the only place a Visitor writes anything in this app.
//
// ⚠️ Once the address is in, the field goes: a form still standing after a `joined` invites the
// reader to wonder whether it worked. What is left is the one line that says it did.
export function WaitlistForm({ join }: { join: JoinWaitlist }) {
  const t = useTranslator();
  const locale = useLocale();
  const [joined, submit, joining] = useActionState<Joined, FormData>(join, { status: "idle" });
  const settled = joined.status === "joined" || joined.status === "already";

  return (
    <div className="mt-5">
      {!settled && (
        <form action={submit} className="relative flex flex-wrap items-end gap-3">
          <div className="w-full max-w-[34ch]">
            <label htmlFor={FIELD_ID} className="font-mono text-diagnostic text-text-muted">
              {t("waitlist.label")}
            </label>
            <input
              id={FIELD_ID}
              name={EMAIL_FIELD}
              type="email"
              required
              maxLength={MAX_EMAIL}
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="you@example.com"
              aria-invalid={joined.status === "invalid" ? true : undefined}
              aria-describedby={NOTE_ID}
              className={`${FIELD} mt-1`}
            />
          </div>
          {/* The language the address is owed its one message in: an action cannot read the root
              parameter the pages read it from, so the form carries it. */}
          <input type="hidden" name={LOCALE_FIELD} value={locale} />
          {/* The field a person never sees and a robot fills: off screen, out of the tab order and
              out of the accessibility tree, so no reader of any kind is asked to fill it. */}
          <div aria-hidden className="absolute left-[-9999px] top-[0px] h-px w-px overflow-hidden">
            <label htmlFor={TRAP_ID}>{t("waitlist.trap")}</label>
            <input id={TRAP_ID} name={TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button type="submit" disabled={joining} className={VERSION_BUTTON_CLASS}>
            {t("waitlist.join")}
          </button>
        </form>
      )}

      {joined.status === "joined" && (
        <p role="status" className="max-w-prose font-mono text-diagnostic text-text">
          <SeverityLabel tone="ok" label="ok:" /> <span className="inline-block">{t("waitlist.joined")}</span>
        </p>
      )}

      {/* Asked twice is not an error and is not drawn like one: the address is on the list, which is
          what the reader wanted (DESIGN.md, The Severity Pairing Rule). */}
      {joined.status === "already" && (
        <p role="status" className="max-w-prose font-mono text-diagnostic text-text-muted">
          <SeverityLabel tone="muted" label="note:" /> <span className="inline-block">{t("waitlist.already")}</span>
        </p>
      )}

      {(joined.status === "invalid" || joined.status === "failed") && (
        <p role="alert" className="mt-2 max-w-prose font-mono text-diagnostic text-breaking">
          <SeverityLabel tone="breaking" label="error:" />{" "}
          <span className="inline-block">
            {joined.status === "invalid" ? t("waitlist.invalid") : t("waitlist.failed")}
          </span>
        </p>
      )}

      {!settled && (
        <p id={NOTE_ID} className="mt-3 max-w-prose font-sans text-meta text-text-muted">
          {t("waitlist.promise")}
        </p>
      )}
    </div>
  );
}
