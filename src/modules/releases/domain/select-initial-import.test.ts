import { describe, expect, it } from "vitest";
import type { Significance } from "./significance";
import { selectInitialImport } from "./select-initial-import";

const now = new Date("2026-09-22T12:00:00Z");

function release(version: string, significance: Significance, date: string) {
  return { version, significance, publishedAt: new Date(`${date}T12:00:00Z`) };
}

function versions(selected: readonly { version: string }[]) {
  return selected.map((entry) => entry.version).sort();
}

describe("selectInitialImport", () => {
  it("keeps the Releases of the last 12 months", () => {
    const selected = selectInitialImport(
      [
        release("8.3.0", "notable", "2026-09-10"),
        release("7.1.0", "notable", "2025-09-23"),
        release("7.0.9", "digest", "2025-09-21"),
      ],
      now,
    );
    expect(versions(selected)).toEqual(["7.1.0", "8.3.0"]);
  });

  it("adds the latest featured Release when it is older than 12 months", () => {
    const selected = selectInitialImport(
      [
        release("6.0.0", "featured", "2024-11-26"),
        release("5.0.0", "featured", "2023-11-16"),
        release("6.3.0", "notable", "2026-01-10"),
      ],
      now,
    );
    expect(versions(selected)).toEqual(["6.0.0", "6.3.0"]);
  });

  it("adds no older featured Release when one falls in the last 12 months", () => {
    const selected = selectInitialImport(
      [release("8.0.0", "featured", "2026-03-12"), release("7.0.0", "featured", "2025-06-24")],
      now,
    );
    expect(versions(selected)).toEqual(["8.0.0"]);
  });

  it("summarizes only the latest featured and the notable Releases of the last 90 days", () => {
    const selected = selectInitialImport(
      [
        release("8.0.0", "featured", "2026-03-12"),
        release("7.0.0", "featured", "2025-10-01"),
        release("8.3.0", "notable", "2026-09-10"),
        release("8.2.0", "notable", "2026-06-24"),
        release("8.1.0", "notable", "2026-06-23"),
        release("8.3.1", "digest", "2026-09-15"),
        release("8.4.0-beta.0", "preview", "2026-09-18"),
      ],
      now,
    );
    const history = Object.fromEntries(selected.map((entry) => [entry.version, entry.history]));
    expect(history).toEqual({
      "8.0.0": false,
      "7.0.0": true,
      "8.3.0": false,
      "8.2.0": false,
      "8.1.0": true,
      "8.3.1": true,
      "8.4.0-beta.0": true,
    });
  });
});
