import { describe, expect, it } from "vitest";
import { ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS, type Attempts, forgetOld, recordAttempt } from "./attempts";

const NOW = 1_700_000_000_000;

describe("recordAttempt", () => {
  it("allows up to the limit and refuses the one after it", () => {
    const attempts: Attempts = new Map();
    for (let i = 0; i < ATTEMPT_LIMIT; i += 1) expect(recordAttempt(attempts, "1.2.3.4", NOW + i)).toBe(true);
    expect(recordAttempt(attempts, "1.2.3.4", NOW + ATTEMPT_LIMIT)).toBe(false);
  });

  it("counts one key at a time", () => {
    const attempts: Attempts = new Map();
    for (let i = 0; i < ATTEMPT_LIMIT; i += 1) recordAttempt(attempts, "1.2.3.4", NOW + i);
    expect(recordAttempt(attempts, "5.6.7.8", NOW)).toBe(true);
  });

  it("lets the key through again once the window has passed", () => {
    const attempts: Attempts = new Map();
    for (let i = 0; i < ATTEMPT_LIMIT; i += 1) recordAttempt(attempts, "1.2.3.4", NOW + i);
    expect(recordAttempt(attempts, "1.2.3.4", NOW + ATTEMPT_WINDOW_MS + 1)).toBe(true);
  });

  // The refusal must not extend the window: a loop that keeps knocking would otherwise lock the key
  // out for as long as it kept knocking.
  it("does not count a refused attempt", () => {
    const attempts: Attempts = new Map();
    for (let i = 0; i < ATTEMPT_LIMIT; i += 1) recordAttempt(attempts, "1.2.3.4", NOW + i);
    recordAttempt(attempts, "1.2.3.4", NOW + 10);
    expect(attempts.get("1.2.3.4")).toHaveLength(ATTEMPT_LIMIT);
  });
});

describe("forgetOld", () => {
  it("drops the keys with nothing left in the window and keeps the others", () => {
    const attempts: Attempts = new Map();
    recordAttempt(attempts, "old", NOW);
    recordAttempt(attempts, "recent", NOW + ATTEMPT_WINDOW_MS);
    forgetOld(attempts, NOW + ATTEMPT_WINDOW_MS + 1);
    expect([...attempts.keys()]).toEqual(["recent"]);
  });
});
