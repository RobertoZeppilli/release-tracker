// The limit the form is defended with, in the absence of Redis: the #176 is not done, so there is no
// store shared between instances to count in (ADR 0010). What is here counts in the memory of one
// process, and does not pretend to be more than that: it stops the noise, and the unique index on
// the address stops the rest.
//
// The shape is a pure function over a map the caller owns, so the rule is testable without a clock
// and without a server: the module that holds the map is the Server Action, and the rule is here.
export const ATTEMPT_LIMIT = 5;

// Ten minutes. Long enough that a loop is stopped, short enough that an office behind one address
// is not locked out for the afternoon: five addresses from one IP in ten minutes is already a
// generous reading of "a person signing up".
export const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export type Attempts = Map<string, number[]>;

// Records one attempt and answers whether it is allowed. The older attempts of that key are dropped
// as they leave the window, which is also what keeps the map from growing: a key with nothing left
// in the window is deleted rather than kept with an empty list.
export function recordAttempt(attempts: Attempts, key: string, now: number): boolean {
  const since = now - ATTEMPT_WINDOW_MS;
  const recent = (attempts.get(key) ?? []).filter((at) => at > since);

  if (recent.length >= ATTEMPT_LIMIT) {
    attempts.set(key, recent);
    return false;
  }

  attempts.set(key, [...recent, now]);
  return true;
}

// Keys that have nothing in the window any more, swept on the way past: the map lives as long as the
// process does, and an IP that signed up once in January is not worth a line in it in June.
export function forgetOld(attempts: Attempts, now: number): void {
  const since = now - ATTEMPT_WINDOW_MS;
  for (const [key, times] of attempts) if (times.every((at) => at <= since)) attempts.delete(key);
}
