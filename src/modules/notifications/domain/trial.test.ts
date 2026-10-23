import { describe, expect, it } from "vitest";
import { EXTERNAL_TRIAL_DAYS, trialOf } from "./trial";

const DAY = 24 * 60 * 60 * 1000;
const START = new Date("2026-10-01T09:00:00.000Z");

function at(days: number, hours = 0): Date {
  return new Date(START.getTime() + days * DAY + hours * 60 * 60 * 1000);
}

describe("trialOf", () => {
  it("has not started while no external channel was ever switched on", () => {
    expect(trialOf(null, at(99))).toEqual({ kind: "not-started" });
  });

  it("counts the whole trial on the day it starts", () => {
    expect(trialOf(START, START)).toEqual({ kind: "running", daysLeft: EXTERNAL_TRIAL_DAYS });
  });

  it("still says one day left on the last day, hours before the end", () => {
    expect(trialOf(START, at(29, 1))).toEqual({ kind: "running", daysLeft: 1 });
    expect(trialOf(START, new Date(START.getTime() + 30 * DAY - 1))).toEqual({ kind: "running", daysLeft: 1 });
  });

  it("ends at the instant the thirty days are up, and stays ended", () => {
    expect(trialOf(START, at(30))).toEqual({ kind: "ended" });
    expect(trialOf(START, at(400))).toEqual({ kind: "ended" });
  });

  it("never says zero days left, which would read as ended while the channels still work", () => {
    for (let hour = 0; hour < EXTERNAL_TRIAL_DAYS * 24; hour += 1) {
      const trial = trialOf(START, at(0, hour));
      expect(trial.kind).toBe("running");
      if (trial.kind === "running") expect(trial.daysLeft).toBeGreaterThan(0);
    }
  });
});
