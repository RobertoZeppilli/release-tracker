import type { Locale, MessageKey, Translator } from "@/modules/i18n";
import { isEnabled, LIVE_CHANNELS, LIVE_EVENTS, type Preference } from "../domain/preferences";
import type { Trial } from "../domain/trial";
import { VERSION_BUTTON_CLASS } from "@/modules/releases/ui";
import { savePreference, startProTrial } from "../server/save-notification-settings";
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

// Null while the trial has not started: before Slack is added there is nothing to count, and the
// dialog of "Add to Slack" is where the thirty days are declared (2026-10-28). The page used to
// carry three paragraphs about the plan; what is left is the countdown, which is a state.
function trialLine(trial: Trial, t: Translator): string | null {
  if (trial.kind === "not-started") return null;
  if (trial.kind === "ended") return t("settings.notifications.trial.ended");
  return t("settings.notifications.trial.left", { count: trial.daysLeft });
}

// The Notifications section of `/settings` (issue #171, ADR 0009): what reaches the Developer, what
// it costs. The language the channels with no address are written in moved to the Language zone of
// the page (#194), where the other language choice is.
//
// A server component, so the rows are drawn from the database on the first paint and a reload shows
// what was saved rather than what a script had in hand; only the switch and the five language
// presses are client components, which is where the action and its error live.
export function NotificationSettings({
  preferences,
  trial,
  slackHint,
  slackOauth,
  devPreview,
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
  // Whether this is a development run, where Slack is drawn without a trial open (2026-10-28).
  devPreview: boolean;
  // What the round left in the address on the way back, already turned into a key, or null.
  slackOutcome: MessageKey | null;
  // The language of the page, which the install route needs to send the Developer back here.
  locale: Locale;
  trial: Trial;
  // A prop and not `getTranslator()`: this file is exported from the module's `ui` index, which
  // client components import too.
  t: Translator;
}) {
  const line = trialLine(trial, t);

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
            switchKey="settings.notifications.switch"
            action={savePreference}
          />
        ))}
      </ul>
      <p className="mt-2 max-w-prose font-sans text-meta text-text-faint">
        {t("settings.notifications.digest")}
      </p>

      {/* Until Pro can be bought (#174), this press is what opens the thirty days, and Slack is
          drawn only once they are open (decided with the user on 2026-10-28). The declaration of
          what the trial is sits here, where it starts, and not in the dialog of "Add to Slack",
          which by then is inside a trial already running.
          A plain form and a server action: nothing to keep in a script, and the page that comes
          back is rendered from the database. */}
      {trial.kind === "not-started" && (
        <form action={startProTrial} className="mt-6 border-t border-rule pt-4">
          <button type="submit" className={VERSION_BUTTON_CLASS}>
            {t("settings.notifications.trial.start")}
          </button>
          <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
            {t("settings.notifications.trial.note")}
          </p>
        </form>
      )}
      {/* ⚠️ In development the whole of Slack is drawn even with no trial open, so the channel can
          be worked on without starting one (asked for on 2026-10-28). In production the press above
          is the only door. */}
      {(trial.kind !== "not-started" || devPreview) && (
        <>
        {/* Slack is a channel and so an `h3`, like the bell: the external channels stay a concept and
            not a heading, which is why their own sentence is prose here. The `Pro` mark and the line
            of the trial hang off this heading, where the channel they are about is, and when #173
            brings the email it becomes a brother of this `h3`, not a fourth level. */}
        <h3 className="mt-6 flex flex-wrap items-baseline gap-2 border-t border-rule pt-4 font-mono text-label text-text">
          {t("settings.notifications.slack.title")}
          {/* The `Pro` mark from the first day, trial included, which is the declaration ADR 0009
              asks for: the habit of free does not come undone. It is the mono word and no drawn
              object, like every other mark in this system. */}
          <span className="font-mono text-diagnostic text-text-muted">{t("settings.notifications.pro")}</span>
        </h3>
        {/* The countdown, and nothing else about the plan: what the trial is and when it starts is
            said in the dialog, at the moment it starts (2026-10-28). Nothing is printed before then. */}
        {line !== null && <p className="mt-2 max-w-prose font-sans text-meta text-text">{line}</p>}

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
              switchKey="settings.notifications.switch.slack"
              action={savePreference}
            />
          ))}
        </ul>
        {/* Said once, under both switches: it is how the channel behaves, not what either switch does. */}
        <p className="mt-2 max-w-prose font-sans text-meta text-text-faint">
          {t("settings.notifications.slack.grouping")}
        </p>
        </>
      )}
    </section>
  );
}
