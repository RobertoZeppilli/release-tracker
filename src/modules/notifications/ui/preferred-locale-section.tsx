import type { Locale, Translator } from "@/modules/i18n";
import { savePreferredLocale } from "../server/save-notification-settings";
import { PreferredLocaleChoice } from "./preferred-locale-choice";

// The language Slack is written in, with the heading and the note that tell it apart from the
// language of the interface it sits beside (#194). It is a component of this module and not markup
// in the page because the action that saves it is this module's, and an index that is `server-only`
// does not re-export a Server Action (see the note in `../server/index.ts`).
//
// ⚠️ **Drawn only once Verdict is in a Slack workspace**, which is when there is a channel to write
// to (decided with the user on 2026-10-28): a choice of language for messages that have nowhere to
// land is a preference about nothing, and the row of five presses would be the loudest thing in a
// zone that, until then, is about the language of the pages. When the channel is removed it goes
// away again, and the value stays saved in the database for the day a channel comes back.
export function PreferredLocaleSection({
  saved,
  connected,
  t,
}: {
  saved: Locale;
  connected: boolean;
  t: Translator;
}) {
  if (!connected) return null;
  return (
    <>
      <h3 className="mt-6 font-mono text-label text-text">{t("settings.notifications.locale.title")}</h3>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
        {t("settings.notifications.locale.note")}
      </p>
      <PreferredLocaleChoice saved={saved} action={savePreferredLocale} />
    </>
  );
}
