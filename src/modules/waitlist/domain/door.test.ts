import { describe, expect, it } from "vitest";
import { BIRTH_WINDOW_MS, bornNow } from "./door";

const NOW = new Date("2026-11-09T20:00:00.000Z");

describe("bornNow", () => {
  it("recognises the account created in this exchange", () => {
    expect(bornNow("2026-11-09T19:59:59.000Z", NOW)).toBe(true);
    expect(bornNow(NOW.toISOString(), NOW)).toBe(true);
  });

  it("leaves an account that existed before alone", () => {
    expect(bornNow("2026-10-01T09:00:00.000Z", NOW)).toBe(false);
    expect(bornNow(new Date(NOW.getTime() - BIRTH_WINDOW_MS - 1).toISOString(), NOW)).toBe(false);
  });

  // The direction of the doubt: this answer decides a deletion, so anything unreadable has to read
  // as "not new". The account stays, and that is the mistake that can be undone.
  it("answers false for a date it cannot read", () => {
    expect(bornNow(undefined, NOW)).toBe(false);
    expect(bornNow(null, NOW)).toBe(false);
    expect(bornNow("", NOW)).toBe(false);
    expect(bornNow("yesterday", NOW)).toBe(false);
  });

  it("does not read a clock ahead of ours as a birth", () => {
    expect(bornNow(new Date(NOW.getTime() + BIRTH_WINDOW_MS + 1).toISOString(), NOW)).toBe(false);
  });
});
