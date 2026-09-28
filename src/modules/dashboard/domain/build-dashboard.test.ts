import { describe, expect, it } from "vitest";
import type { SummaryContent } from "@/modules/summaries";
import { buildDashboard, type DashboardRelease, type FollowedTechnology } from "./build-dashboard";

const NOW = new Date("2024-12-06T12:00:00Z");

const react: FollowedTechnology = { slug: "react", name: "React" };
const vite: FollowedTechnology = { slug: "vite", name: "Vite" };
const typescript: FollowedTechnology = { slug: "typescript", name: "TypeScript" };
const tailwind: FollowedTechnology = { slug: "tailwind", name: "Tailwind CSS" };

function needsAction(): SummaryContent {
  return summary({
    actionRequired: true,
    breakingChanges: [{ change: "String refs are removed", migration: "Use callback refs" }],
  });
}

function summary(options: Partial<SummaryContent> = {}): SummaryContent {
  return {
    title: "Actions, the use API and ref as a prop arrive.",
    actionRequired: false,
    keyPoints: [{ text: "one" }, { text: "two" }, { text: "three" }],
    breakingChanges: [],
    ...options,
  };
}

function release(options: Partial<DashboardRelease> & { slug: string; version: string }): DashboardRelease {
  return {
    significance: "featured",
    publishedAt: new Date("2024-12-05T00:00:00Z"),
    summaryStatus: "ready",
    summary: summary(),
    ...options,
  };
}

describe("buildDashboard", () => {
  it("gives a followed Technology the featured Releases of the last 30 days", () => {
    const dashboard = buildDashboard([react], [release({ slug: "react", version: "19.0.0" })], NOW);

    expect(dashboard.spotlight).toHaveLength(1);
    const [entry] = dashboard.spotlight;
    expect(entry.technology).toEqual(react);
    expect(entry.featured.map((found) => found.version)).toEqual(["19.0.0"]);
  });

  it("counts the window from the injected now, keeping the Release published exactly 30 days back", () => {
    const dashboard = buildDashboard(
      [react],
      [
        release({ slug: "react", version: "19.0.0", publishedAt: new Date("2024-11-06T12:00:00Z") }),
        release({ slug: "react", version: "18.3.1", publishedAt: new Date("2024-11-06T11:59:59Z") }),
      ],
      NOW,
    );

    expect(dashboard.spotlight[0].featured.map((found) => found.version)).toEqual(["19.0.0"]);
  });

  it("falls back to the latest major, however old, when nothing is featured in the window", () => {
    const dashboard = buildDashboard(
      [react],
      [
        release({ slug: "react", version: "18.3.1", significance: "notable" }),
        release({ slug: "react", version: "18.0.0", publishedAt: new Date("2022-03-29T00:00:00Z") }),
        release({ slug: "react", version: "17.0.0", publishedAt: new Date("2020-10-20T00:00:00Z") }),
      ],
      NOW,
    );

    const [entry] = dashboard.spotlight;
    expect(entry.featured).toEqual([]);
    expect(entry.standing).toEqual({ release: expect.objectContaining({ version: "18.0.0" }), major: true });
  });

  it("orders the entries by the ones needing action, then the safe ones, then the compact rows", () => {
    const dashboard = buildDashboard(
      [tailwind, react, typescript, vite],
      [
        release({ slug: "react", version: "19.0.0", publishedAt: new Date("2024-12-05T00:00:00Z"), summary: needsAction() }),
        release({ slug: "vite", version: "6.0.0", publishedAt: new Date("2024-11-26T00:00:00Z"), summary: needsAction() }),
        release({ slug: "typescript", version: "5.7.2", publishedAt: new Date("2024-11-22T00:00:00Z") }),
        release({ slug: "tailwind", version: "3.0.0", publishedAt: new Date("2021-12-09T00:00:00Z") }),
      ],
      NOW,
    );

    expect(dashboard.spotlight.map((entry) => entry.technology.name)).toEqual([
      "React",
      "Vite",
      "TypeScript",
      "Tailwind CSS",
    ]);
  });

  it("stacks two featured Releases of the same Technology in its cell, the newest first", () => {
    const dashboard = buildDashboard(
      [react],
      [
        release({ slug: "react", version: "19.0.0", publishedAt: new Date("2024-11-20T00:00:00Z") }),
        release({ slug: "react", version: "19.2.0", publishedAt: new Date("2024-12-01T00:00:00Z") }),
      ],
      NOW,
    );

    expect(dashboard.spotlight[0].featured.map((found) => found.version)).toEqual(["19.2.0", "19.0.0"]);
  });

  it("shows a featured Release with no ready Summary, without counting it as safe or as action", () => {
    const dashboard = buildDashboard(
      [react, vite],
      [
        release({ slug: "react", version: "19.0.0", summaryStatus: "pending", summary: null }),
        release({ slug: "vite", version: "6.0.0", summary: needsAction() }),
      ],
      NOW,
    );

    const waiting = dashboard.spotlight.find((entry) => entry.technology.slug === "react");
    expect(waiting?.featured.map((found) => found.version)).toEqual(["19.0.0"]);
    expect(dashboard.verdict).toEqual({ needsAction: 1, safe: 0 });
  });

  it("counts the window by Significance, across the followed Technologies only", () => {
    const dashboard = buildDashboard(
      [react, vite],
      [
        release({ slug: "react", version: "19.0.0" }),
        release({ slug: "react", version: "19.1.0", significance: "notable" }),
        release({ slug: "vite", version: "6.1.0", significance: "notable" }),
        release({ slug: "vite", version: "7.0.0-beta.1", significance: "preview" }),
        release({ slug: "vite", version: "6.0.1", significance: "digest" }),
        release({ slug: "react", version: "18.3.2", significance: "digest", publishedAt: new Date("2024-01-01T00:00:00Z") }),
        release({ slug: "svelte", version: "5.0.0" }),
      ],
      NOW,
    );

    expect(dashboard.counts).toEqual({ technologies: 2, featured: 1, notable: 2, previews: 1, digest: 1 });
  });

  it("is empty when the Developer follows nothing, which is what the empty state reads", () => {
    const dashboard = buildDashboard([], [release({ slug: "react", version: "19.0.0" })], NOW);

    expect(dashboard.spotlight).toEqual([]);
    expect(dashboard.verdict).toEqual({ needsAction: 0, safe: 0 });
    expect(dashboard.counts.technologies).toBe(0);
  });

  it("falls back to the latest recorded Release when no major was ever recorded", () => {
    const dashboard = buildDashboard(
      [react],
      [
        release({ slug: "react", version: "19.2.1", significance: "digest", publishedAt: new Date("2024-06-01T00:00:00Z") }),
        release({ slug: "react", version: "19.3.0", significance: "notable", publishedAt: new Date("2024-07-01T00:00:00Z") }),
      ],
      NOW,
    );

    expect(dashboard.spotlight[0].standing).toEqual({
      release: expect.objectContaining({ version: "19.3.0" }),
      major: false,
    });
  });

  it("fills Latest, Previews and the Weekly Digest with the window of the followed Technologies", () => {
    const dashboard = buildDashboard(
      [react, vite],
      [
        release({ slug: "react", version: "19.1.0", significance: "notable", publishedAt: new Date("2024-12-04T00:00:00Z") }),
        release({ slug: "vite", version: "6.1.0", significance: "notable", publishedAt: new Date("2024-12-05T00:00:00Z") }),
        release({ slug: "vite", version: "7.0.0-beta.1", significance: "preview" }),
        release({ slug: "vite", version: "6.0.1", significance: "digest", publishedAt: new Date("2024-12-03T00:00:00Z") }),
        release({ slug: "react", version: "18.3.2", significance: "digest", publishedAt: new Date("2024-11-20T00:00:00Z") }),
        release({ slug: "react", version: "19.0.1", significance: "notable", publishedAt: new Date("2024-01-01T00:00:00Z") }),
        release({ slug: "svelte", version: "5.1.0", significance: "notable" }),
      ],
      NOW,
    );

    expect(dashboard.latest.map(({ release: found, technology }) => [technology.name, found.version])).toEqual([
      ["Vite", "6.1.0"],
      ["React", "19.1.0"],
    ]);
    expect(dashboard.previews.map(({ release: found }) => found.version)).toEqual(["7.0.0-beta.1"]);
    expect(dashboard.digest.map((week) => [week.key, week.rows.length])).toEqual([
      ["2024-W49", 1],
      ["2024-W47", 1],
    ]);
  });

  it("names the current ISO week, which is how a row says it happened this week", () => {
    const dashboard = buildDashboard([], [], NOW);

    expect(dashboard.thisWeek).toBe("2024-W49");
  });

  it("has empty sections when the Developer follows nothing", () => {
    const dashboard = buildDashboard([], [release({ slug: "react", version: "19.1.0", significance: "notable" })], NOW);

    expect(dashboard.latest).toEqual([]);
    expect(dashboard.previews).toEqual([]);
    expect(dashboard.digest).toEqual([]);
  });

  it("does not let a Preview stand for a Technology, however new it is", () => {
    const dashboard = buildDashboard(
      [react],
      [
        release({ slug: "react", version: "19.3.0", significance: "notable", publishedAt: new Date("2024-07-01T00:00:00Z") }),
        release({ slug: "react", version: "19.4.0-beta.1", significance: "preview", publishedAt: new Date("2024-08-01T00:00:00Z") }),
      ],
      NOW,
    );

    expect(dashboard.spotlight[0].standing).toEqual({
      release: expect.objectContaining({ version: "19.3.0" }),
      major: false,
    });
  });

  it("stands a Technology on a Preview when it has never published anything else", () => {
    const dashboard = buildDashboard(
      [react],
      [release({ slug: "react", version: "1.0.0-beta.2", significance: "preview", publishedAt: new Date("2024-07-01T00:00:00Z") })],
      NOW,
    );

    expect(dashboard.spotlight[0].standing).toEqual({
      release: expect.objectContaining({ version: "1.0.0-beta.2" }),
      major: false,
    });
  });
});
