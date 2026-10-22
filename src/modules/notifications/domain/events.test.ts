import { describe, expect, it } from "vitest";
import { isSummarySettled, releaseEventFor } from "./events";

describe("releaseEventFor", () => {
  it("is an event for the two Significances worth interrupting someone", () => {
    expect(releaseEventFor("featured")).toBe("featured_release");
    expect(releaseEventFor("notable")).toBe("notable_release");
  });

  it("is silent for a digest Release, which arrives inside the weekly Digest", () => {
    expect(releaseEventFor("digest")).toBeNull();
  });

  it("is silent for a Preview, which is noise for whoever is not looking for one", () => {
    expect(releaseEventFor("preview")).toBeNull();
  });
});

describe("isSummarySettled", () => {
  it("waits while the Summary is still coming", () => {
    expect(isSummarySettled("pending")).toBe(false);
    expect(isSummarySettled("processing")).toBe(false);
  });

  it("is settled when the Summary is ready", () => {
    expect(isSummarySettled("ready")).toBe(true);
  });

  it("is settled when the Summary will never arrive, so the Notification is born without a verdict", () => {
    expect(isSummarySettled("unavailable")).toBe(true);
    expect(isSummarySettled("skipped")).toBe(true);
    expect(isSummarySettled("failed")).toBe(true);
  });
});
