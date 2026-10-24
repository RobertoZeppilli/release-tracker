import { describe, expect, it } from "vitest";
import { buildDashboard } from "./build-dashboard";
import { declared, needsAction, NOW, release, technology } from "./fixtures";

const react = technology("react", "React", declared("18.2.0"));
const vite = technology("vite", "Vite", declared("5.4.11"));
const node = technology("node", "Node.js");

describe("buildDashboard", () => {
  // GLOSSARY.md, Verdetto della Dashboard: the verdict is the sum of the Standing's rows by
  // construction. The page used to print `3` over two rows that each said `1`.
  it("prints a verdict that is the sum of the rows under it", () => {
    const dashboard = buildDashboard(
      [react, vite, node],
      [
        release({ slug: "react", version: "19.0.0", summary: needsAction() }),
        release({ slug: "vite", version: "6.0.0", summary: needsAction() }),
        release({ slug: "node", version: "23.4.0", significance: "notable" }),
      ],
      NOW,
    );

    expect(dashboard.verdict).toEqual({ needsAction: 2, safe: 1 });
    expect(dashboard.standing.rows.reduce((total, row) => total + row.needsAction, 0)).toBe(2);
  });

  it("gives no verdict where nothing in the set can be judged", () => {
    const dashboard = buildDashboard(
      [node],
      [release({ slug: "node", version: "23.4.0", summary: null, summaryStatus: "pending" })],
      NOW,
    );

    expect(dashboard.verdict).toBeNull();
  });

  it("gives no verdict to a Developer who follows nothing", () => {
    expect(buildDashboard([], [], NOW).verdict).toBeNull();
  });

  it("reads the last 30 days, and says which ones", () => {
    const dashboard = buildDashboard(
      [node],
      [
        release({ slug: "node", version: "23.4.0", significance: "notable" }),
        release({
          slug: "node",
          version: "22.0.0",
          significance: "notable",
          publishedAt: new Date("2024-06-01T00:00:00Z"),
        }),
      ],
      NOW,
    );

    expect(dashboard.stream.total).toBe(1);
    expect(dashboard.window).toEqual({ start: new Date("2024-11-06T12:00:00Z"), end: NOW });
  });

  // A Release of a Technology that is not followed is somebody else's: the page reads the
  // Developer's own follows, and a stray row would answer neither of the two questions.
  it("leaves out a Release of a Technology nobody follows", () => {
    const dashboard = buildDashboard([node], [release({ slug: "react", version: "19.0.0" })], NOW);

    expect(dashboard.stream.days).toEqual([]);
    expect(dashboard.standing.rows).toHaveLength(1);
  });
});
