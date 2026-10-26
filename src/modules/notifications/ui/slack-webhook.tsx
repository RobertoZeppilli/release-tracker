"use client";

import { useActionState } from "react";
import { useTranslator } from "@/modules/i18n/ui";
import { SeverityLabel, VERSION_BUTTON_CLASS, VERSION_INPUT_CLASS } from "@/modules/releases/ui";
import type { SaveWebhook, SendTest, TestSent, WebhookSaved } from "../domain/saving";

const FIELD_ID = "slack-webhook";
const HINT_ID = "slack-webhook-hint";

// The field is a URL and not a version, so it takes the width of the measure instead of 11ch; the
// rest is the project's one input, unchanged (`VERSION_INPUT_CLASS`).
const FIELD = `${VERSION_INPUT_CLASS} w-full max-w-measure stacked:w-full`;

// The webhook of `/settings` (#172): where the messages go, and the proof that they arrive.
//
// ⚠️ The field is never filled with the saved URL, because the saved URL is not readable: what is
// printed under it is the hint, the host and the last four characters. A browser that offers to
// remember it is told not to, since a password manager holding a webhook is a secret in one more
// place for no gain.
export function SlackWebhook({
  hint,
  save,
  test,
}: {
  // What the database holds now, or null when no webhook was ever saved.
  hint: string | null;
  // Handed down rather than imported: a client component may not import a module's `server` folder
  // (ADR 0006, and `domain/saving` says the rest).
  save: SaveWebhook;
  test: SendTest;
}) {
  const t = useTranslator();
  const [saved, write, saving] = useActionState<WebhookSaved, FormData>(save, { status: "idle", hint });
  const [sent, send, sending] = useActionState<TestSent, FormData>(test, { status: "idle", error: null });

  return (
    <div className="mt-4">
      <form action={write} className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-measure">
          <label htmlFor={FIELD_ID} className="font-mono text-diagnostic text-text-muted">
            {t("settings.notifications.slack.label")}
          </label>
          <input
            id={FIELD_ID}
            name="webhook"
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://hooks.slack.com/services/…"
            aria-invalid={saved.status === "failed" ? true : undefined}
            aria-describedby={HINT_ID}
            className={`${FIELD} mt-1`}
          />
        </div>
        <button type="submit" disabled={saving} className={VERSION_BUTTON_CLASS}>
          {t("settings.notifications.slack.save")}
        </button>
      </form>

      <p id={HINT_ID} className="mt-2 max-w-prose font-sans text-meta text-text-muted">
        {saved.hint === null
          ? t("settings.notifications.slack.none")
          : t("settings.notifications.slack.current", { hint: saved.hint })}
      </p>

      {saved.status === "failed" && (
        <p role="alert" className="mt-2 max-w-prose font-mono text-diagnostic text-breaking">
          <SeverityLabel tone="breaking" label="error:" />{" "}
          <span className="inline-block">{t("settings.notifications.slack.invalid")}</span>
        </p>
      )}

      {/* The proof of delivery is its own form, because it is a send and not a save: pressing it
          must not write anything, and the field above must not be posted with it. */}
      <form action={send} className="mt-3">
        <button type="submit" disabled={sending || saved.hint === null} className={VERSION_BUTTON_CLASS}>
          {t("settings.notifications.slack.test")}
        </button>
      </form>

      {sent.status === "sent" && (
        <p role="status" className="mt-2 max-w-prose font-mono text-diagnostic text-text">
          <SeverityLabel tone="ok" label="ok:" />{" "}
          <span className="inline-block">{t("settings.notifications.slack.testOk")}</span>
        </p>
      )}
      {sent.status === "failed" && (
        <p role="alert" className="mt-2 max-w-prose font-mono text-diagnostic text-breaking">
          <SeverityLabel tone="breaking" label="error:" />{" "}
          <span className="inline-block">
            {sent.error === null
              ? t("settings.notifications.slack.testEmpty")
              : t("settings.notifications.slack.testFailed", { error: sent.error })}
          </span>
        </p>
      )}
    </div>
  );
}
