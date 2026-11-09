import type { Locale, Translator } from "@/modules/i18n";
import { LAUNCH_DAY, launchDay } from "../domain/launch";
import { joinWaitlist } from "../server/join-waitlist";
import { WaitlistForm } from "./waitlist-form";

// The Waitlist on the landing (ADR 0010): the date, what the one message will be, and the field.
//
// It sits right under the first screen and not at the foot of the page: the reader who is convinced
// is convinced by the demonstration above it, and the ones who scroll past the close were never
// going to leave an address. The two actions of the close stay where they are.
//
// ⚠️ The date is printed, in words and in a `datetime`: a precise day is a promise, and a promise is
// what makes somebody leave an address. "Soon" does not.
export function WaitlistBlock({ locale, t }: { locale: Locale; t: Translator }) {
  return (
    <section
      id="waitlist"
      aria-labelledby="waitlist-title"
      data-arrival=""
      className="border-t border-rule py-8 max-sm:py-7"
    >
      <h2 id="waitlist-title" className="max-w-[30ch] font-mono text-status">
        {t("waitlist.claim", { day: launchDay(locale) })}
      </h2>
      <p className="mt-4 max-w-[64ch] font-sans text-body text-text-muted">{t("waitlist.body")}</p>
      {/* The machine-readable day beside the sentence that says it, so the two cannot disagree. */}
      <p className="mt-3 font-mono text-meta text-text-faint">
        <time dateTime={LAUNCH_DAY}>{LAUNCH_DAY}</time>
      </p>
      {/* The action is handed down and not imported by the form: a client component may not reach a
          module's `server` folder (ADR 0006). */}
      <WaitlistForm join={joinWaitlist} />
    </section>
  );
}
