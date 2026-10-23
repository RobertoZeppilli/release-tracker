import type { Locale, MessageKey, Translator } from "@/modules/i18n";
import { isEnabled, LIVE_CHANNELS, LIVE_EVENTS, type Preference } from "../domain/preferences";
import { EXTERNAL_TRIAL_DAYS, type Trial } from "../domain/trial";
import { savePreference, savePreferredLocale } from "../server/save-notification-settings";
import { PreferenceRow } from "./preference-row";
import { PreferredLocaleChoice } from "./preferred-locale-choice";

// The one channel a switch can be drawn for today (`canSwitch`): the bell. Slack and the email are
// declared below instead of switched, because a switch for a channel that sends nothing would be a
// promise, and #172 and #173 each bring their own.
const [BELL] = LIVE_CHANNELS;

// The two strings an event needs, by event, so a third one cannot be added here without its words.
const ROWS: Readonly<Record<(typeof LIVE_EVENTS)[number], { label: MessageKey; off: MessageKey }>> = {
  featured_release: { label: "settings.notifications.featured.label", off: "settings.notifications.featured.off" },
  notable_release: { label: "settings.notifications.notable.label", off: "settings.notifications.notable.off" },
};

function trialLine(trial: Trial, t: Translator): string {
  if (trial.kind === "not-started")
    return t("settings.notifications.trial.waiting", { count: EXTERNAL_TRIAL_DAYS });
  if (trial.kind === "ended") return t("settings.notifications.trial.ended");
  return t("settings.notifications.trial.left", { count: trial.daysLeft });
}

// The Notifications section of `/settings` (issue #171, ADR 0009): what reaches the Developer, what
// it costs, and the language the channels that have no address will be written in.
//
// A server component, so the rows are drawn from the database on the first paint and a reload shows
// what was saved rather than what a script had in hand; only the switch and the five language
// presses are client components, which is where the action and its error live.
export function NotificationSettings({
  preferences,
  preferredLocale,
  trial,
  t,
}: {
  preferences: readonly Preference[];
  preferredLocale: Locale;
  trial: Trial;
  // A prop and not `getTranslator()`: this file is exported from the module's `ui` index, which
  // client components import too.
  t: Translator;
}) {
  return (
    <section aria-labelledby="notifications" className="mt-8 max-w-measure border-t border-rule pt-4">
      <h2 id="notifications" className="font-mono text-label text-text">
        {t("settings.notifications.title")}
      </h2>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
        {t("settings.notifications.intro")}
      </p>

      <ul className="mt-4">
        {LIVE_EVENTS.map((event) => (
          <PreferenceRow
            key={event}
            event={event}
            channel={BELL}
            enabled={isEnabled(preferences, event, BELL)}
            label={t(ROWS[event].label)}
            consequence={t(ROWS[event].off)}
            action={savePreference}
          />
        ))}
      </ul>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-faint">
        {t("settings.notifications.digest")}
      </p>

      <h3 className="mt-6 flex flex-wrap items-baseline gap-2 border-t border-rule pt-4 font-mono text-label text-text">
        {t("settings.notifications.external.title")}
        {/* The `Pro` mark from the first day, trial included, which is the declaration ADR 0009
            asks for: the habit of free does not come undone. It is the mono word and no drawn
            object, like every other mark in this system. */}
        <span className="font-mono text-diagnostic text-text-muted">{t("settings.notifications.pro")}</span>
      </h3>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
        {t("settings.notifications.external.body")}
      </p>
      <p className="mt-2 max-w-prose font-sans text-meta text-text">{trialLine(trial, t)}</p>

      <h3 className="mt-6 border-t border-rule pt-4 font-mono text-label text-text">
        {t("settings.notifications.locale.title")}
      </h3>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
        {t("settings.notifications.locale.note")}
      </p>
      <PreferredLocaleChoice saved={preferredLocale} action={savePreferredLocale} />
    </section>
  );
}
