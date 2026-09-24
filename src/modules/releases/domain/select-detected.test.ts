import { describe, expect, it } from "vitest";
import { type DetectionCandidate, selectDetected } from "./select-detected";

const AT = (iso: string) => new Date(iso);

function candidate(version: string, iso: string, significance: DetectionCandidate["significance"]): DetectionCandidate {
  return { version, publishedAt: AT(iso), significance };
}

describe("selectDetected", () => {
  const known = { versions: ["19.0.0", "19.1.0"], latestPublishedAt: AT("2026-06-01T00:00:00Z") };

  it("keeps only the Versions published after the newest known one", () => {
    const selected = selectDetected(
      [
        candidate("18.0.0", "2024-01-01T00:00:00Z", "featured"),
        candidate("19.1.0", "2026-06-01T00:00:00Z", "notable"),
        candidate("19.2.0", "2026-06-02T00:00:00Z", "notable"),
      ],
      known,
    );
    expect(selected.map((release) => release.version)).toEqual(["19.2.0"]);
  });

  it("registers a Version already known even if it comes back with a later date", () => {
    const selected = selectDetected([candidate("19.1.0", "2026-06-05T00:00:00Z", "notable")], known);
    expect(selected).toEqual([]);
  });

  it("registers a backport of an old major published today", () => {
    const selected = selectDetected([candidate("18.3.1", "2026-06-02T00:00:00Z", "digest")], known);
    expect(selected.map((release) => release.version)).toEqual(["18.3.1"]);
  });

  it("returns the new Releases oldest first", () => {
    const selected = selectDetected(
      [candidate("19.3.0", "2026-06-10T00:00:00Z", "notable"), candidate("19.2.0", "2026-06-02T00:00:00Z", "notable")],
      known,
    );
    expect(selected.map((release) => release.version)).toEqual(["19.2.0", "19.3.0"]);
  });

  // The Initial Import decides which past Releases a Technology starts with (12 months, ADR 0005):
  // a Detection that ran first would register the whole history instead.
  it("does nothing for a Technology without Releases", () => {
    const selected = selectDetected([candidate("19.2.0", "2026-06-02T00:00:00Z", "notable")], {
      versions: [],
      latestPublishedAt: null,
    });
    expect(selected).toEqual([]);
  });

  describe("Previews", () => {
    it("summarizes the first Preview of a major nobody has seen", () => {
      const selected = selectDetected([candidate("20.0.0-beta.0", "2026-06-02T00:00:00Z", "preview")], known);
      expect(selected).toEqual([expect.objectContaining({ version: "20.0.0-beta.0", summarize: true })]);
    });

    it("skips the later Previews of the same major, in the same run", () => {
      const selected = selectDetected(
        [
          candidate("20.0.0-rc.0", "2026-06-04T00:00:00Z", "preview"),
          candidate("20.0.0-beta.0", "2026-06-02T00:00:00Z", "preview"),
        ],
        known,
      );
      expect(selected.map((release) => [release.version, release.summarize])).toEqual([
        ["20.0.0-beta.0", true],
        ["20.0.0-rc.0", false],
      ]);
    });

    it("skips a Preview of a major that is already known", () => {
      const selected = selectDetected([candidate("20.0.0-rc.0", "2026-06-04T00:00:00Z", "preview")], {
        versions: ["20.0.0-beta.0"],
        latestPublishedAt: AT("2026-06-01T00:00:00Z"),
      });
      expect(selected).toEqual([expect.objectContaining({ summarize: false })]);
    });

    it("skips a Preview of a major that already shipped a stable Release", () => {
      const selected = selectDetected([candidate("19.2.0-rc.0", "2026-06-04T00:00:00Z", "preview")], known);
      expect(selected).toEqual([expect.objectContaining({ summarize: false })]);
    });
  });

  it("summarizes everything but the Digests", () => {
    const selected = selectDetected(
      [
        candidate("20.0.0", "2026-06-02T00:00:00Z", "featured"),
        candidate("19.2.0", "2026-06-03T00:00:00Z", "notable"),
        candidate("19.2.1", "2026-06-04T00:00:00Z", "digest"),
      ],
      known,
    );
    expect(selected.map((release) => release.summarize)).toEqual([true, true, false]);
  });
});
