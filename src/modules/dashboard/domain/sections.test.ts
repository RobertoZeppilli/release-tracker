import { describe, expect, it } from "vitest";
import type { DashboardRelease, FollowedTechnology } from "./build-dashboard";
import { type DashboardRow, sectionRows, weeklyDigest } from "./sections";

const node: FollowedTechnology = { slug: "node", name: "Node.js", currentVersion: null };
const vite: FollowedTechnology = { slug: "vite", name: "Vite", currentVersion: null };

function row(technology: FollowedTechnology, version: string, publishedAt: string, significance: DashboardRelease["significance"] = "notable"): DashboardRow {
  const release: DashboardRelease = {
    slug: technology.slug,
    version,
    significance,
    publishedAt: new Date(publishedAt),
    summaryStatus: "ready",
    summary: null,
  };
  return { technology, release };
}

describe("sectionRows", () => {
  it("keeps one Significance and puts the newest first", () => {
    const rows = [
      row(node, "23.3.0", "2024-11-20T00:00:00Z"),
      row(vite, "6.0.0-beta.1", "2024-12-04T00:00:00Z", "preview"),
      row(node, "23.4.0", "2024-12-05T00:00:00Z"),
    ];

    expect(sectionRows(rows, "notable").map(({ release }) => release.version)).toEqual(["23.4.0", "23.3.0"]);
    expect(sectionRows(rows, "preview").map(({ release }) => release.version)).toEqual(["6.0.0-beta.1"]);
  });

  it("orders two Releases published the same day by Version, the newest first", () => {
    const rows = [
      row(node, "22.12.0", "2024-12-03T00:00:00Z"),
      row(node, "23.4.0", "2024-12-03T00:00:00Z"),
    ];

    expect(sectionRows(rows, "notable").map(({ release }) => release.version)).toEqual(["23.4.0", "22.12.0"]);
  });
});

describe("weeklyDigest", () => {
  it("groups the digest Releases by ISO week in UTC, the newest week first", () => {
    const digest = weeklyDigest([
      row(node, "20.18.1", "2024-12-03T00:00:00Z", "digest"),
      row(vite, "5.4.10", "2024-11-12T00:00:00Z", "digest"),
      row(vite, "6.0.3", "2024-12-05T00:00:00Z", "digest"),
      row(node, "23.4.0", "2024-12-05T00:00:00Z"),
    ]);

    expect(digest.map((week) => week.key)).toEqual(["2024-W49", "2024-W46"]);
    expect(digest[0].rows.map(({ release }) => release.version)).toEqual(["6.0.3", "20.18.1"]);
  });

  it("carries the Monday and the Sunday of each week, for the range in the summary line", () => {
    const [week] = weeklyDigest([row(vite, "6.0.3", "2024-12-05T00:00:00Z", "digest")]);

    expect(week.start).toEqual(new Date("2024-12-02T00:00:00Z"));
    expect(week.end).toEqual(new Date("2024-12-08T00:00:00Z"));
  });

  it("keeps the days around New Year in the ISO week they belong to, not in their calendar year", () => {
    const digest = weeklyDigest([
      row(node, "23.6.0", "2024-12-30T00:00:00Z", "digest"),
      row(node, "23.5.0", "2024-12-29T00:00:00Z", "digest"),
    ]);

    expect(digest.map((week) => week.key)).toEqual(["2025-W01", "2024-W52"]);
  });

  it("has no week when nothing is digest", () => {
    expect(weeklyDigest([row(node, "23.4.0", "2024-12-05T00:00:00Z")])).toEqual([]);
  });
});
