import { describe, expect, it } from "vitest";
import type { Significance } from "./significance";
import { computeUpgradePath, recordedHistory, type UpgradePath, upgradeStartRejection } from "./upgrade-path";

function release(version: string, significance: Significance, actionRequired: boolean | null = null, unjudged = false) {
  return { version, significance, actionRequired, unjudged, publishedAt: new Date("2026-01-01T00:00:00Z") };
}

type Release = ReturnType<typeof release>;

function path(result: UpgradePath<Release>) {
  if (result.type !== "path") throw new Error(`expected a path, got ${result.type}`);
  return result;
}

function versions(result: UpgradePath<Release>): string[] {
  return path(result).majors.flatMap(({ rows }) =>
    rows.flatMap((row) => (row.type === "release" ? [row.release.version] : row.releases.map(({ version }) => version))),
  );
}

describe("computeUpgradePath", () => {
  // GLOSSARY.md, Note giudicabili: a Release whose notes could not be judged is one to check, so it
  // joins `missing` and is counted again under `unjudged`, which is what keeps the words honest.
  it("counts a Release whose notes could not be judged as one to check, never as safe", () => {
    const result = path(
      computeUpgradePath([release("6.1.0", "notable", false), release("6.2.0", "featured", null, true)], "6.0.0"),
    );
    expect(result.counts).toMatchObject({ total: 2, safe: 1, missing: 1, unjudged: 1, actionRequired: 0 });
  });

  it("covers the stable Releases after `from`, up to and including the latest stable one", () => {
    const result = computeUpgradePath(
      [
        release("5.1.0", "notable"),
        release("5.2.0", "notable"),
        release("5.2.1", "digest"),
        release("6.0.0", "featured"),
        release("6.0.1", "digest"),
        release("6.1.0-beta.0", "preview"),
      ],
      "5.2.0",
    );
    expect(path(result)).toMatchObject({ from: "5.2.0", to: "6.0.1", recorded: true });
    expect(versions(result)).toEqual(["5.2.1", "6.0.0", "6.0.1"]);
  });

  it("groups the range by major from the oldest, in Version order, folding consecutive digest Releases", () => {
    const { majors } = path(
      computeUpgradePath(
        [
          release("6.0.1", "digest"),
          release("5.3.10", "digest"),
          release("6.0.0", "featured"),
          release("5.3.2", "digest"),
          release("5.4.0", "notable"),
          release("5.3.0", "notable"),
        ],
        "5.2.0",
      ),
    );
    expect(
      majors.map(({ major, rows }) => [
        major,
        rows.map((row) => (row.type === "release" ? row.release.version : `digest ${row.releases.map(({ version }) => version).join(",")}`)),
      ]),
    ).toEqual([
      [5, ["5.3.0", "digest 5.3.2,5.3.10", "5.4.0"]],
      [6, ["6.0.0", "digest 6.0.1"]],
    ]);
  });

  it("counts action required only from ready Summaries and says how many are missing, leaving digest out", () => {
    const result = path(
      computeUpgradePath(
        [
          release("5.2.0", "notable"),
          release("5.3.0", "notable", false),
          release("5.3.1", "digest"),
          release("5.4.0", "notable"),
          release("6.0.0", "featured", true),
          release("6.0.1", "digest"),
          release("6.1.0", "notable", true),
        ],
        "5.2.0",
      ),
    );
    const counts = { total: 6, featured: 1, notable: 3, digest: 2, actionRequired: 2, safe: 1, missing: 1, unjudged: 0 };
    expect(result.counts).toEqual(counts);
    expect(result.majors.map(({ major, counts }) => [major, counts])).toEqual([
      [5, { total: 3, featured: 0, notable: 2, digest: 1, actionRequired: 0, safe: 1, missing: 1, unjudged: 0 }],
      [6, { total: 3, featured: 1, notable: 1, digest: 1, actionRequired: 2, safe: 0, missing: 0, unjudged: 0 }],
    ]);
  });

  it("gives an empty path when `from` is already the latest stable Release", () => {
    const result = path(computeUpgradePath([release("6.0.0", "featured", true), release("6.0.1", "digest")], "6.0.1"));
    expect(result).toMatchObject({ from: "6.0.1", to: "6.0.1", recorded: true, majors: [] });
    expect(result.counts.total).toBe(0);
  });

  it.each([
    ["malformed", "abc"],
    ["malformed", "v6"],
    ["notOlder", "6.0.2"],
    ["notOlder", "99.0.0"],
  ])("rejects a %s `from` (%s) and names the latest stable Release", (reason, from) => {
    expect(computeUpgradePath([release("6.0.0", "featured"), release("6.0.1", "digest")], from)).toEqual({
      type: "invalid",
      from,
      reason,
      latest: "6.0.1",
    });
  });

  it("still computes the path from a Version that is not recorded, suggesting the recorded ones around it", () => {
    const releases = [release("19.0.0", "featured"), release("19.2.0", "notable"), release("19.2.1", "digest")];
    const result = path(computeUpgradePath(releases, "19.1.0"));
    expect(result).toMatchObject({ recorded: false, suggestions: ["19.0.0", "19.2.0"] });
    expect(versions(result)).toEqual(["19.2.0", "19.2.1"]);
  });

  it("suggests only the oldest recorded Release when `from` comes before all of them", () => {
    const result = path(computeUpgradePath([release("19.0.0", "featured"), release("19.2.0", "notable")], "18.3.1"));
    expect(result).toMatchObject({ recorded: false, suggestions: ["19.0.0"] });
  });

  it("makes no suggestion when `from` is recorded", () => {
    expect(path(computeUpgradePath([release("19.0.0", "featured"), release("19.2.0", "notable")], "19.0.0")).suggestions).toEqual([]);
  });

  it("lists the Previews ahead of the latest stable Release apart, outside the range and its counts", () => {
    const result = path(
      computeUpgradePath(
        [
          release("6.0.0-beta.1", "preview"),
          release("6.0.0", "featured", true),
          release("6.1.0-rc.0", "preview"),
          release("6.1.0-beta.0", "preview"),
        ],
        "5.4.0",
      ),
    );
    expect(result.previews.map(({ version }) => version)).toEqual(["6.1.0-beta.0", "6.1.0-rc.0"]);
    expect(versions(result)).toEqual(["6.0.0"]);
    expect(result.counts.total).toBe(1);
  });

  it("accepts a `from` typed with a leading v or surrounding spaces, as developers often write it", () => {
    const result = path(computeUpgradePath([release("6.0.0", "featured"), release("6.0.1", "digest")], " v6.0.0 "));
    expect(result).toMatchObject({ from: "6.0.0", recorded: true });
    expect(versions(result)).toEqual(["6.0.1"]);
  });

  it("treats a recorded Preview as a recorded starting point", () => {
    const result = path(computeUpgradePath([release("6.0.0-beta.1", "preview"), release("6.0.0", "featured")], "6.0.0-beta.1"));
    expect(result).toMatchObject({ recorded: true, suggestions: [] });
    expect(versions(result)).toEqual(["6.0.0"]);
  });

  it("rejects any `from` when there is no stable Release yet", () => {
    expect(computeUpgradePath([release("1.0.0-beta.0", "preview")], "0.9.0")).toEqual({
      type: "invalid",
      from: "0.9.0",
      reason: "noStable",
      latest: null,
    });
  });
});

describe("upgradeStartRejection", () => {
  const releases = [release("1.0.0", "featured"), release("1.1.0", "notable")];

  it("accepts a Version the path can start from, the latest stable included", () => {
    expect(upgradeStartRejection(releases, "1.0.0")).toBeNull();
    expect(upgradeStartRejection(releases, "1.1.0")).toBeNull();
    expect(upgradeStartRejection(releases, "0.9.0")).toBeNull();
  });

  it("names the reason the path would refuse it", () => {
    expect(upgradeStartRejection(releases, "1.x")).toBe("malformed");
    expect(upgradeStartRejection(releases, "2.0.0")).toBe("notOlder");
    expect(upgradeStartRejection([release("1.0.0-beta.0", "preview")], "0.9.0")).toBe("noStable");
  });
});

describe("recordedHistory", () => {
  const releases = [
    release("5.9.0", "featured"),
    release("6.0.0", "featured", true),
    release("6.0.1", "digest"),
    release("6.1.0", "notable", false),
    release("7.0.0-beta.1", "notable"),
    release("6.0.0-rc.1", "notable"),
  ];

  // What the link into this view promises: the Releases the list prints, which are the stable ones
  // plus the Previews ahead of the latest. `6.0.0-rc.1` is already followed by its stable Version,
  // so the list leaves it out and the count must leave it out too.
  it("counts the Releases the list prints, not the ones recorded", () => {
    const history = recordedHistory(releases);
    expect(history).toMatchObject({ listed: 5, stable: 4, previews: 1 });
  });

  it("reads the majors newest first, with the counts a path would give them", () => {
    const history = recordedHistory(releases);
    expect(history.majors.map(({ major }) => major)).toEqual([6, 5]);
    expect(history.majors[0].counts).toMatchObject({ total: 3, featured: 1, notable: 1, digest: 1, actionRequired: 1, safe: 1 });
  });

  it("holds up with nothing recorded at all", () => {
    expect(recordedHistory([])).toEqual({ listed: 0, stable: 0, previews: 0, majors: [] });
  });
});
