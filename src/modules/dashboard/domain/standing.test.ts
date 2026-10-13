import { describe, expect, it } from "vitest";
import { declared, needsAction, release, summary, technology } from "./fixtures";
import { buildStanding } from "./standing";

const WINDOW_START = new Date("2024-11-06T12:00:00Z");

const react = technology("react", "React", declared("18.2.0"));
const next = technology("next", "Next.js", declared("15.0.0", "2024-10-01"));
const node = technology("node", "Node.js");

function words(row: { needsAction: number; distance: number | null }) {
  return { needsAction: row.needsAction, distance: row.distance };
}

describe("buildStanding", () => {
  it("gives every followed Technology exactly one row, in step or not", () => {
    const standing = buildStanding([react, node], [release({ slug: "react", version: "19.0.0" })], WINDOW_START);

    expect(standing.rows.map((row) => row.technology.slug)).toEqual(["react", "node"]);
  });

  it("counts the Distance from the declared Version in use, and names it", () => {
    const standing = buildStanding(
      [next],
      [
        release({ slug: "next", version: "15.0.0", significance: "notable" }),
        release({ slug: "next", version: "15.0.1", significance: "digest" }),
        release({ slug: "next", version: "15.1.0", significance: "notable" }),
      ],
      WINDOW_START,
    );

    expect(standing.rows[0].distance).toBe(2);
    expect(standing.rows[0].declared).toBe("15.0.0");
    expect(standing.rows[0].latest).toBe("15.1.0");
  });

  it("gives a Technology with no declaration no Distance at all", () => {
    const standing = buildStanding([node], [release({ slug: "node", version: "23.4.0" })], WINDOW_START);

    expect(standing.rows[0].distance).toBeNull();
    expect(standing.rows[0].declared).toBeNull();
    expect(standing.rows[0].latest).toBe("23.4.0");
  });

  it("counts a Release that is both in the window and ahead of the declaration once", () => {
    const standing = buildStanding(
      [react],
      [
        release({ slug: "react", version: "18.2.0", significance: "notable" }),
        release({ slug: "react", version: "19.0.0", summary: needsAction() }),
      ],
      WINDOW_START,
    );

    expect(words(standing.rows[0])).toEqual({ needsAction: 1, distance: 1 });
  });

  it("counts a Release of the window even where nothing was declared", () => {
    const standing = buildStanding(
      [node],
      [release({ slug: "node", version: "23.4.0", summary: needsAction() })],
      WINDOW_START,
    );

    expect(words(standing.rows[0])).toEqual({ needsAction: 1, distance: null });
  });

  it("leaves out a Release older than the window that the declaration does not reach", () => {
    const standing = buildStanding(
      [node],
      [
        release({
          slug: "node",
          version: "22.0.0",
          publishedAt: new Date("2024-06-01T00:00:00Z"),
          summary: needsAction(),
        }),
      ],
      WINDOW_START,
    );

    expect(words(standing.rows[0])).toEqual({ needsAction: 0, distance: null });
  });

  it("counts neither a Digest nor a Release without a verdict", () => {
    const standing = buildStanding(
      [node],
      [
        release({ slug: "node", version: "23.3.0", significance: "digest", summary: null, summaryStatus: null }),
        release({ slug: "node", version: "23.4.0", summary: null, summaryStatus: "pending" }),
      ],
      WINDOW_START,
    );

    expect(standing.rows[0]).toMatchObject({ needsAction: 0, safe: 0, missing: 1 });
  });

  it("orders the rows: action by number, then Distance, then no declaration, then in step", () => {
    const standing = buildStanding(
      [
        technology("vitest", "Vitest", declared("2.1.6")),
        technology("tailwind", "Tailwind CSS", declared("3.4.16")),
        node,
        technology("vite", "Vite", declared("5.4.11")),
        react,
      ],
      [
        release({ slug: "vitest", version: "2.1.7", significance: "notable" }),
        release({ slug: "vitest", version: "2.1.8", significance: "notable" }),
        release({ slug: "tailwind", version: "3.4.16", significance: "notable" }),
        release({ slug: "node", version: "23.4.0", significance: "notable" }),
        release({ slug: "vite", version: "6.0.0", summary: needsAction() }),
        release({ slug: "react", version: "18.3.0", significance: "notable" }),
        release({ slug: "react", version: "19.0.0", summary: needsAction() }),
        release({ slug: "react", version: "19.0.1", significance: "digest" }),
      ],
      WINDOW_START,
    );

    expect(standing.rows.map((row) => row.technology.slug)).toEqual([
      "react",
      "vite",
      "vitest",
      "node",
      "tailwind",
    ]);
  });

  it("drops the bar lane where fewer than two rows carry a Distance", () => {
    const one = buildStanding([react, node], [release({ slug: "react", version: "19.0.0" })], WINDOW_START);
    const two = buildStanding(
      [react, technology("vite", "Vite", declared("5.4.11"))],
      [release({ slug: "react", version: "19.0.0" }), release({ slug: "vite", version: "6.0.0" })],
      WINDOW_START,
    );

    expect(one.scale).toBeNull();
    expect(two.scale).toBe(1);
  });

  it("sums the Distances and keeps the oldest declaration, the stalest thing under the count", () => {
    const standing = buildStanding(
      [react, next, node],
      [
        release({ slug: "react", version: "19.0.0", significance: "notable" }),
        release({ slug: "next", version: "15.1.0", significance: "notable" }),
        release({ slug: "next", version: "15.2.0", summary: null, summaryStatus: "failed" }),
      ],
      WINDOW_START,
    );

    expect(standing.behind).toBe(3);
    expect(standing.missing).toBe(1);
    expect(standing.since).toEqual(new Date("2024-09-12T00:00:00Z"));
  });

  it("has no total to print where nobody declared a Version in use", () => {
    const standing = buildStanding([node], [release({ slug: "node", version: "23.4.0" })], WINDOW_START);

    expect(standing.since).toBeNull();
    expect(standing.behind).toBe(0);
    expect(standing.scale).toBeNull();
  });

  it("gives no Distance to a declaration the recorded Releases no longer place", () => {
    const standing = buildStanding(
      [technology("vite", "Vite", declared("99.0.0"))],
      [release({ slug: "vite", version: "6.0.0", summary: summary() })],
      WINDOW_START,
    );

    expect(standing.rows[0].distance).toBeNull();
    expect(standing.rows[0].declared).toBeNull();
  });
});
