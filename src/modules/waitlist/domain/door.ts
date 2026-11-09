// The door of the callback (ADR 0010). While the launch is in the future no account is born: the
// code exchange has already created one by the time our own code runs, so what the callback does is
// recognise the account that was *just* created and take it away again.
//
// Two minutes: an account that came into existence inside the last two minutes came into existence
// in this very exchange. Nobody else's account is two minutes old, and the margin is wide enough
// that a clock a few seconds off does not change the answer.
export const BIRTH_WINDOW_MS = 2 * 60 * 1000;

// ⚠️ It answers **false** for a date it cannot read, and that direction is the whole point: this
// answer decides a deletion, so what is not understood must never look like a new account. An
// unreadable date leaves the Developer signed in, which is the mistake that can be undone.
export function bornNow(createdAt: string | null | undefined, now: Date): boolean {
  if (typeof createdAt !== "string") return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const age = now.getTime() - created;
  // A date in the future is not an age: a clock ahead of ours would otherwise read as a birth.
  return age >= -BIRTH_WINDOW_MS && age <= BIRTH_WINDOW_MS;
}
