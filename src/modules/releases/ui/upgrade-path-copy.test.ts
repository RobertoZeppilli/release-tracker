import { describe, expect, it } from "vitest";
import type { PathCounts } from "../domain/upgrade-path";
import { invalidMessage, majorWords, pathSentence, pathVerdict } from "./upgrade-path-copy";

const none: PathCounts = { total: 0, featured: 0, notable: 0, digest: 0, actionRequired: 0, safe: 0, missing: 0 };

describe("upgrade path copy", () => {
  it("leads with the Releases that need action", () => {
    const counts = { ...none, total: 36, featured: 1, notable: 2, digest: 33, actionRequired: 1, safe: 1, missing: 1 };
    expect(pathVerdict(counts)).toEqual({ tone: "action", label: "warning:", claim: "1 needs action" });
    expect(pathSentence("5.2.0", "6.0.3", counts)).toBe(
      "Between 5.2.0 and 6.0.3 there are 36 releases: 1 needs action, 1 is safe to upgrade, 1 has no summary yet (check its notes) and 33 are digest fixes you can skip.",
    );
  });

  it("never calls a path safe while some Releases have no Summary", () => {
    expect(pathVerdict({ ...none, total: 3, notable: 2, digest: 1, safe: 1, missing: 1 })).toEqual({
      tone: "muted",
      label: "note:",
      claim: "1 to check",
    });
  });

  it("calls a fully summarized path without action safe, and an empty one up to date", () => {
    expect(pathVerdict({ ...none, total: 2, notable: 1, digest: 1, safe: 1 }).claim).toBe("safe to upgrade");
    expect(pathVerdict(none).claim).toBe("up to date");
    expect(pathSentence("6.0.3", "6.0.3", none)).toBe("6.0.3 is already the latest stable release.");
  });

  it("writes the counts of a major in words, leaving out the zeros", () => {
    expect(majorWords({ ...none, total: 4, featured: 1, digest: 3, actionRequired: 1 })).toEqual({
      kinds: "4 releases · 1 featured · 3 digest",
      action: "1 needs action",
      missing: null,
    });
  });

  it("explains how to fix an invalid starting Version", () => {
    expect(invalidMessage("malformed", "abc", "6.0.3")).toBe("abc is not a version. Write it as major.minor.patch, for example 6.0.3.");
    expect(invalidMessage("notOlder", "7.0.0", "6.0.3")).toBe("7.0.0 is newer than 6.0.3, the latest stable release.");
  });
});
