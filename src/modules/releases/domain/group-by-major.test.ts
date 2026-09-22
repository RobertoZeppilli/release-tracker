import { describe, expect, it } from "vitest";
import { groupByMajor } from "./group-by-major";
import type { Significance } from "./significance";

function release(version: string, significance: Significance) {
  return { version, significance, publishedAt: new Date("2026-01-01T00:00:00Z") };
}

function describeRows(rows: ReturnType<typeof groupByMajor>["majors"][number]["rows"]) {
  return rows.map((row) =>
    row.type === "release" ? row.release.version : `digest ${row.releases.map((entry) => entry.version).join(",")}`,
  );
}

describe("groupByMajor", () => {
  it("lists the newest major first, each in Version order, folding consecutive digest Releases", () => {
    const { majors } = groupByMajor([
      release("5.4.1", "digest"),
      release("6.0.1", "digest"),
      release("5.3.0", "notable"),
      release("6.0.0", "featured"),
      release("5.3.10", "digest"),
      release("5.3.2", "digest"),
      release("6.0.2", "digest"),
      release("5.4.0", "notable"),
    ]);
    expect(majors.map(({ major, count }) => [major, count])).toEqual([
      [6, 3],
      [5, 5],
    ]);
    expect(describeRows(majors[0].rows)).toEqual(["6.0.0", "digest 6.0.1,6.0.2"]);
    expect(describeRows(majors[1].rows)).toEqual(["5.3.0", "digest 5.3.2,5.3.10", "5.4.0", "digest 5.4.1"]);
  });

  it("names the highest stable Version as the latest", () => {
    const grouped = groupByMajor([release("8.3.0", "notable"), release("7.3.6", "digest"), release("8.4.0-beta.0", "preview")]);
    expect(grouped.latest).toBe("8.3.0");
  });

  it("lists the Previews ahead of the latest Version apart, leaving out those already released", () => {
    const grouped = groupByMajor([
      release("8.3.0", "notable"),
      release("8.3.0-beta.1", "preview"),
      release("9.0.0-beta.0", "preview"),
      release("8.4.0-beta.0", "preview"),
    ]);
    expect(grouped.previews.map((entry) => entry.version)).toEqual(["8.4.0-beta.0", "9.0.0-beta.0"]);
    expect(grouped.majors.flatMap((group) => describeRows(group.rows))).toEqual(["8.3.0"]);
  });

  it("is empty without Releases", () => {
    expect(groupByMajor([])).toEqual({ latest: null, majors: [], previews: [] });
  });
});
