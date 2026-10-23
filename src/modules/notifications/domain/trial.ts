// The 30 day trial of the external channels (ADR 0009). It starts the first time a Developer
// switches Slack or the email on, never at sign-up, so nobody finds it spent without having used
// it; the bell does not consume it, because the bell is free for good.
export const EXTERNAL_TRIAL_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

// Three states, because `/settings` says a different line for each and a number alone could not
// tell "never started" from "nothing left": a Developer who has not switched a channel on still has
// the whole trial, and saying "0 days left" to them would be a lie in the other direction.
export type Trial =
  | { kind: "not-started" }
  | { kind: "running"; daysLeft: number }
  | { kind: "ended" };

// ⚠️ `daysLeft` is never 0 while the trial runs: the last day is one day left, and the instant the
// thirty days are up the state is `ended`. That is what makes the line true **on the day it
// expires**, which is the criterion of issue #171: a floor would print "0 days left" for the whole
// of the last day, when the channels still work.
export function trialOf(startedAt: Date | null, now: Date): Trial {
  if (startedAt === null) return { kind: "not-started" };
  const endsAt = startedAt.getTime() + EXTERNAL_TRIAL_DAYS * DAY_MS;
  const left = endsAt - now.getTime();
  if (left <= 0) return { kind: "ended" };
  return { kind: "running", daysLeft: Math.ceil(left / DAY_MS) };
}
