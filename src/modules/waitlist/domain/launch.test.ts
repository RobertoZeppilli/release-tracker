import { describe, expect, it } from "vitest";
import { doorClosed, LAUNCH_AT, LAUNCH_DAY, launchDay } from "./launch";

describe("the launch", () => {
  it("is the day the landing and the login page name", () => {
    expect(LAUNCH_DAY).toBe("2027-01-20");
    expect(LAUNCH_AT.toISOString().slice(0, 10)).toBe(LAUNCH_DAY);
  });

  it("keeps the door shut until the hour of the launch, and opens it then", () => {
    expect(doorClosed(new Date("2026-11-09T12:00:00.000Z"))).toBe(true);
    expect(doorClosed(new Date("2027-01-20T07:59:59.999Z"))).toBe(true);
    expect(doorClosed(LAUNCH_AT)).toBe(false);
    expect(doorClosed(new Date("2027-02-01T00:00:00.000Z"))).toBe(false);
  });

  // The day is written out in the reader's language, and it is the same day in every time zone:
  // the test is here because a formatter without `timeZone` passes in Rome and fails in Honolulu.
  it("names the day in the reader's language", () => {
    expect(launchDay("en")).toBe("January 20, 2027");
    expect(launchDay("it")).toBe("20 gennaio 2027");
    expect(launchDay("fr")).toBe("20 janvier 2027");
    expect(launchDay("es")).toBe("20 de enero de 2027");
    expect(launchDay("de")).toBe("20. Januar 2027");
  });
});
