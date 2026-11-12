import { describe, expect, it } from "vitest";
import { planReleaseNotifications, type ReleaseCandidate } from "./plan";
import type { Preference } from "./preferences";

const featured: ReleaseCandidate = {
  releaseId: "release-1",
  technologyId: "tech-1",
  significance: "featured",
  summaryStatus: "ready",
};

const followed = ["tech-1"];
const noPreferences: readonly Preference[] = [];

describe("planReleaseNotifications", () => {
  it("gives a Notification to a Release of a followed Technology", () => {
    const planned = planReleaseNotifications({ candidates: [featured], followed, preferences: noPreferences });
    expect(planned).toEqual([{ event: "featured_release", releaseId: "release-1" }]);
  });

  it("gives none for a Technology that is not followed", () => {
    const planned = planReleaseNotifications({
      candidates: [featured],
      followed: ["tech-2"],
      preferences: noPreferences,
    });
    expect(planned).toEqual([]);
  });

  it("waits for the Summary instead of notifying at Detection", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, summaryStatus: "pending" }],
      followed,
      preferences: noPreferences,
    });
    expect(planned).toEqual([]);
  });

  it("notifies a Release whose Summary will never arrive, without a verdict", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, summaryStatus: "unavailable" }],
      followed,
      preferences: noPreferences,
    });
    expect(planned).toHaveLength(1);
  });

  it("stays silent on a digest Release and on a Preview", () => {
    const planned = planReleaseNotifications({
      candidates: [
        { ...featured, significance: "digest", summaryStatus: "skipped" },
        { ...featured, significance: "preview" },
      ],
      followed,
      preferences: noPreferences,
    });
    expect(planned).toEqual([]);
  });

  it("respects the event switched off on every channel", () => {
    const planned = planReleaseNotifications({
      candidates: [featured],
      followed,
      preferences: [
        { event: "featured_release", channel: "in_app", enabled: false },
        { event: "featured_release", channel: "slack", enabled: false },
        { event: "featured_release", channel: "email", enabled: false },
      ],
    });
    expect(planned).toEqual([]);
  });

  // The switch is per event: turning `featured` off leaves `notable` where it was.
  it("leaves the other event alone when one is switched off everywhere", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, significance: "notable" }],
      followed,
      preferences: [
        { event: "featured_release", channel: "in_app", enabled: false },
        { event: "featured_release", channel: "slack", enabled: false },
        { event: "featured_release", channel: "email", enabled: false },
      ],
    });
    expect(planned).toEqual([{ event: "notable_release", releaseId: "release-1" }]);
  });

  it("tells the two Release events apart", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, significance: "notable" }],
      followed,
      preferences: noPreferences,
    });
    expect(planned).toEqual([{ event: "notable_release", releaseId: "release-1" }]);
  });
});
