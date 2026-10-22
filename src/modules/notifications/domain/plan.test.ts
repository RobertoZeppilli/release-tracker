import { describe, expect, it } from "vitest";
import { type Follower, planReleaseNotifications, type ReleaseCandidate } from "./plan";
import type { Preference } from "./preferences";

const featured: ReleaseCandidate = {
  releaseId: "release-1",
  technologyId: "tech-1",
  significance: "featured",
  summaryStatus: "ready",
};

const followers: Follower[] = [
  { userId: "dev-1", technologyId: "tech-1" },
  { userId: "dev-2", technologyId: "tech-1" },
];

const noPreferences = new Map<string, readonly Preference[]>();

describe("planReleaseNotifications", () => {
  it("gives one Notification to every Developer who follows the Technology", () => {
    const planned = planReleaseNotifications({ candidates: [featured], followers, preferences: noPreferences });
    expect(planned).toEqual([
      { userId: "dev-1", event: "featured_release", releaseId: "release-1" },
      { userId: "dev-2", event: "featured_release", releaseId: "release-1" },
    ]);
  });

  it("gives none to a Developer who does not follow the Technology", () => {
    const planned = planReleaseNotifications({
      candidates: [featured],
      followers: [{ userId: "dev-3", technologyId: "tech-2" }],
      preferences: noPreferences,
    });
    expect(planned).toEqual([]);
  });

  it("waits for the Summary instead of notifying at Detection", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, summaryStatus: "pending" }],
      followers,
      preferences: noPreferences,
    });
    expect(planned).toEqual([]);
  });

  it("notifies a Release whose Summary will never arrive, without a verdict", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, summaryStatus: "unavailable" }],
      followers,
      preferences: noPreferences,
    });
    expect(planned).toHaveLength(2);
  });

  it("stays silent on a digest Release and on a Preview", () => {
    const planned = planReleaseNotifications({
      candidates: [
        { ...featured, significance: "digest", summaryStatus: "skipped" },
        { ...featured, significance: "preview" },
      ],
      followers,
      preferences: noPreferences,
    });
    expect(planned).toEqual([]);
  });

  it("respects a Developer who switched that event off everywhere, and only them", () => {
    const planned = planReleaseNotifications({
      candidates: [featured],
      followers,
      preferences: new Map([
        [
          "dev-1",
          [
            { event: "featured_release", channel: "in_app", enabled: false },
            { event: "featured_release", channel: "slack", enabled: false },
            { event: "featured_release", channel: "email", enabled: false },
          ] as const,
        ],
      ]),
    });
    expect(planned).toEqual([{ userId: "dev-2", event: "featured_release", releaseId: "release-1" }]);
  });

  it("tells the two Release events apart", () => {
    const planned = planReleaseNotifications({
      candidates: [{ ...featured, significance: "notable" }],
      followers: [followers[0]],
      preferences: noPreferences,
    });
    expect(planned).toEqual([{ userId: "dev-1", event: "notable_release", releaseId: "release-1" }]);
  });
});
