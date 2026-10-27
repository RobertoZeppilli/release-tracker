import { z } from "zod";
import type { Locale, MessageKey, Translator } from "@/modules/i18n";
import { VERSION_BUTTON_CLASS } from "@/modules/releases/ui";

// "Add to Slack" (#188): one link, which Slack answers with the channel picker. A link and not a
// form, because pressing it writes nothing: the route it reaches only signs a `state` and redirects.
//
// ⚠️ No `client_id` and no URL of Slack's are built here: this is the server's own route, and the
// consent URL is assembled there. The rule of `CLAUDE.md` is that no external call leaves the
// client, and an `href` to slack.com with our credentials in it would be the client holding them.

// What the callback is allowed to have put in the address, and the sentence each outcome reads as.
// Anything else prints nothing at all: the address is the reader's to edit, so a value that is not
// one of these is not a state of the product.
const OutcomeSchema = z.enum(["connected", "cancelled", "failed", "denied", "unavailable"]);

const OUTCOMES: Readonly<Record<z.infer<typeof OutcomeSchema>, MessageKey>> = {
  connected: "settings.notifications.slack.result.connected",
  cancelled: "settings.notifications.slack.result.cancelled",
  failed: "settings.notifications.slack.result.failed",
  denied: "settings.notifications.slack.result.denied",
  unavailable: "settings.notifications.slack.result.unavailable",
};

export function slackOutcomeKey(raw: string | null | undefined): MessageKey | null {
  const parsed = OutcomeSchema.safeParse(raw);
  return parsed.success ? OUTCOMES[parsed.data] : null;
}

export function SlackConnect({ locale, t }: { locale: Locale; t: Translator }) {
  return (
    <p className="mt-4">
      {/* The locale travels in the query so the return lands on `/settings` in this language: the
          route lives outside `[locale]`, as the login routes do, and carries it in the `state`. */}
      <a href={`/slack/install?locale=${locale}`} className={VERSION_BUTTON_CLASS}>
        {t("settings.notifications.slack.connect")}
      </a>
    </p>
  );
}
