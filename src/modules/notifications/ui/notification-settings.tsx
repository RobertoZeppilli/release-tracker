import type { Locale, MessageKey, Translator } from "@/modules/i18n";
import { isEnabled, LIVE_CHANNELS, LIVE_EVENTS, type Preference } from "../domain/preferences";
import { savePreference } from "../server/save-notification-settings";
import { saveSlackWebhook, sendSlackTest } from "../server/save-slack";
import { PreferenceRow } from "./preference-row";
import { SlackConnect } from "./slack-connect";
import { SlackWebhook } from "./slack-webhook";

// The channels a switch may be drawn for (`canSwitch`): the bell, free for good, and Slack, which
// #172 lit. The email is not named anywhere on this page until #173 sends one: a channel announced
// before it exists is a promise, and the words for it were taken out on 2026-10-28.
const [BELL, SLACK] = LIVE_CHANNELS;

// The two strings an event needs, by event, so a third one cannot be added here without its words.
const ROWS: Readonly<Record<(typeof LIVE_EVENTS)[number], { label: MessageKey; off: MessageKey }>> = {
  featured_release: { label: "settings.notifications.featured.label", off: "settings.notifications.featured.off" },
  notable_release: { label: "settings.notifications.notable.label", off: "settings.notifications.notable.off" },
};

// The same two events on Slack say something else when they are off: the bell keeps ringing, and it
// is the channel that goes quiet. The bell's sentence would have claimed the Notification itself.
const SLACK_OFF: Readonly<Record<(typeof LIVE_EVENTS)[number], MessageKey>> = {
  featured_release: "settings.notifications.slack.featured.off",
  notable_release: "settings.notifications.slack.notable.off",
};

// The Notifications section of `/settings` (issue #171): what reaches the Developer. What it cost
// is not a question any more -- the `Pro` mark, the thirty day trial and the press that opened it
// left with the Plan (issue #209, ADR 0011) -- so every channel here is simply on or off. The
// language the channels with no address are written in moved to the Language zone of the page
// (#194), where the other language choice is.
//
// A server component, so the rows are drawn from the database on the first paint and a reload shows
// what was saved rather than what a script had in hand; only the switch and the five language
// presses are client components, which is where the action and its error live.
export function NotificationSettings({
  preferences,
  slackHint,
  slackOauth,
  slackOutcome,
  locale,
  t,
}: {
  preferences: readonly Preference[];
  // The hint of the saved webhook, or null: the URL itself is not readable, by grant (#172). Since
  // #188 it is the channel by name when the webhook came from "Add to Slack", and the host with
  // four characters when it was pasted, because that is all a pasted URL can say about itself.
  slackHint: string | null;
  // Whether "Add to Slack" exists at all: it needs the credentials of the Slack app, which are
  // unset in development, where Slack's HTTPS `redirect_uri` cannot be satisfied (#188).
  slackOauth: boolean;
  // What the round left in the address on the way back, already turned into a key, or null.
  slackOutcome: MessageKey | null;
  // The language of the page, which the install route needs to send the Developer back here.
  locale: Locale;
  // A prop and not `getTranslator()`: this file is exported from the module's `ui` index, which
  // client components import too.
  t: Translator;
}) {
  return (
    <section aria-labelledby="notifications" className="mt-8 max-w-measure border-t border-rule pt-4">
      <h2 id="notifications" className="font-sans text-title font-semibold text-text">
        {t("settings.notifications.title")}
      </h2>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
        {t("settings.notifications.intro")}
      </p>

      {/* The channels are the `h3` of this zone, one each, and the levels stop there: the heading
          structure is assistive reading and not decoration (WCAG 2.2 AA, 1.3.1). What was an `h4`
          and an `h5` here is now a mark, a line of prose or nothing at all. */}
      <h3 className="mt-6 font-mono text-label text-text">{t("settings.notifications.bell.title")}</h3>
      <ul className="mt-4">
        {LIVE_EVENTS.map((event) => (
          <PreferenceRow
            key={event}
            event={event}
            channel={BELL}
            enabled={isEnabled(preferences, event, BELL)}
            label={t(ROWS[event].label)}
            consequence={t(ROWS[event].off)}
            switchName={t("settings.notifications.switch", { name: t(ROWS[event].label) })}
            action={savePreference}
          />
        ))}
      </ul>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-faint">
        {t("settings.notifications.digest")}
      </p>

      {/* Slack is a channel and so an `h3`, like the bell: the external channels stay a concept and
          not a heading, which is why their own sentence is prose here. When #173 brings the email it
          becomes a brother of this `h3`, not a fourth level. The `Pro` mark that used to hang off it
          went with the Plan (issue #209). */}
      <h3 className="mt-6 border-t border-rule pt-4 font-mono text-label text-text">
        {t("settings.notifications.slack.title")}
      </h3>

      {/* The press, with the dialog that explains it; the field below is the way in that is left
          when the round cannot run, and in development it is the only one (#188). */}
      {slackOauth && <SlackConnect locale={locale} />}
      {slackOutcome && (
        <p
          role="status"
          className="mt-3 max-w-prose font-mono text-diagnostic text-text"
        >
          {t(slackOutcome)}
        </p>
      )}
      {/* ⚠️ The field to paste a webhook into is drawn **only when "Add to Slack" does not exist**,
          which is when the Slack app's credentials are unset, which is development and the CI. In
          production the channel is added by the press alone. It is not deleted because Slack demands
          an HTTPS `redirect_uri` and refuses `localhost`, so in development the round cannot run and
          the field is the only way to prove the channel locally (#194).
          ⚠️ The consequence: the CI has no Slack credentials, so **every E2E sees this variant**.
          The production layout, the one without the field, is covered by no automatic proof. */}
      {!slackOauth && (
        <>
          {/* Not a heading any more, a line that names what follows: a sixth level under Slack would
              be structure for one field, and `slack.manual` keeps its words either way. */}
          <p className="mt-6 font-mono text-label text-text-muted">
            {t("settings.notifications.slack.manual")}
          </p>
          <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
            {t("settings.notifications.slack.manualNote")}
          </p>
          <SlackWebhook hint={slackHint} save={saveSlackWebhook} test={sendSlackTest} />
        </>
      )}
      {/* The switches come after the webhook, in the order the Developer does it: there is nothing
          to switch on before there is somewhere to send. */}
      <ul className="mt-4">
        {LIVE_EVENTS.map((event) => (
          <PreferenceRow
            key={`slack-${event}`}
            event={event}
            channel={SLACK}
            enabled={isEnabled(preferences, event, SLACK)}
            label={t(ROWS[event].label)}
            consequence={t(SLACK_OFF[event])}
            switchName={t("settings.notifications.switch.slack", { name: t(ROWS[event].label) })}
            action={savePreference}
          />
        ))}
      </ul>
      {/* Said once, under both switches: it is how the channel behaves, not what either switch does. */}
      <p className="mt-2 max-w-prose font-sans text-meta text-text-faint">
        {t("settings.notifications.slack.grouping")}
      </p>
    </section>
  );
}
