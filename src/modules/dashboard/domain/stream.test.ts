import { describe, expect, it } from "vitest";
import { release, technology } from "./fixtures";
import { buildStream } from "./stream";
import type { DashboardRow } from "./followed";

const node = technology("node", "Node.js");
const react = technology("react", "React");

// The ISO week of 2024-12-06, the day the Stream's tests read as today.
const THIS_WEEK = "2024-W49";

function row(version: string, options: Partial<Parameters<typeof release>[0]> = {}): DashboardRow {
  return { technology: node, release: release({ slug: "node", version, ...options }) };
}

describe("buildStream", () => {
  it("puts the Releases of one day in one block, newest day first", () => {
    const stream = buildStream(
      [
        row("23.3.0", { publishedAt: new Date("2024-11-20T00:00:00Z") }),
        row("23.4.0", { publishedAt: new Date("2024-12-05T10:00:00Z") }),
        row("22.12.0", { publishedAt: new Date("2024-12-05T08:00:00Z") }),
      ],
      THIS_WEEK,
    );

    expect(stream.days.map((day) => day.date)).toEqual(["2024-12-05", "2024-11-20"]);
    expect(stream.days[0].rows.map(({ release: it }) => it.version)).toEqual(["23.4.0", "22.12.0"]);
  });

  it("orders two Releases of the same instant by Version, so the order never changes between visits", () => {
    const same = new Date("2024-12-05T00:00:00Z");
    const stream = buildStream([row("23.4.0", { publishedAt: same }), row("23.5.0", { publishedAt: same })], THIS_WEEK);

    expect(stream.days[0].rows.map(({ release: it }) => it.version)).toEqual(["23.5.0", "23.4.0"]);
  });

  it("marks the day and not each Release of it", () => {
    const stream = buildStream(
      [
        row("23.4.0", { publishedAt: new Date("2024-12-05T00:00:00Z") }),
        row("23.3.0", { publishedAt: new Date("2024-11-20T00:00:00Z") }),
      ],
      THIS_WEEK,
    );

    expect(stream.days.map((day) => day.thisWeek)).toEqual([true, false]);
  });

  it("takes the Digests out of the days and folds them per ISO week, newest week first", () => {
    const stream = buildStream(
      [
        row("23.4.0", { significance: "digest", publishedAt: new Date("2024-12-03T00:00:00Z") }),
        row("23.3.0", { significance: "digest", publishedAt: new Date("2024-11-20T00:00:00Z") }),
        { technology: react, release: release({ slug: "react", version: "19.0.0" }) },
      ],
      THIS_WEEK,
    );

    expect(stream.days).toHaveLength(1);
    expect(stream.days[0].rows[0].release.version).toBe("19.0.0");
    expect(stream.digest.map((week) => week.key)).toEqual(["2024-W49", "2024-W47"]);
    expect(stream.digest[0].rows.map(({ release: it }) => it.version)).toEqual(["23.4.0"]);
  });

  it("counts every Release of its window, the folded ones included", () => {
    const stream = buildStream([row("23.4.0"), row("23.3.0", { significance: "digest" })], THIS_WEEK);

    expect(stream.total).toBe(2);
  });
});
