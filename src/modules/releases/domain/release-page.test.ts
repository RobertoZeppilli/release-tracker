import { describe, expect, it } from "vitest";
import { noteLines, releasePath, versionFromPath } from "./release-page";

describe("releasePath", () => {
  it("joins the Technology slug and the Version", () => {
    expect(releasePath("vite", "6.0.0")).toBe("/technologies/vite/6.0.0");
  });

  it("encodes build metadata so `+` survives the URL", () => {
    expect(releasePath("vite", "1.0.0+build.5")).toBe("/technologies/vite/1.0.0%2Bbuild.5");
  });
});

describe("versionFromPath", () => {
  it("decodes what releasePath encoded", () => {
    expect(versionFromPath("1.0.0%2Bbuild.5")).toBe("1.0.0+build.5");
  });

  it("rejects a malformed segment", () => {
    expect(versionFromPath("%E0%A4%A")).toBeNull();
  });
});

describe("noteLines", () => {
  it("splits the notes into lines, keeping blank lines inside", () => {
    expect(noteLines("# Title\n\nText")).toEqual(["# Title", "", "Text"]);
  });

  it("accepts Windows and old Mac line endings", () => {
    expect(noteLines("a\r\nb\rc")).toEqual(["a", "b", "c"]);
  });

  it("drops trailing blank lines", () => {
    expect(noteLines("a\n\n  \n")).toEqual(["a"]);
  });

  it("returns no lines for empty notes", () => {
    expect(noteLines("")).toEqual([]);
  });
});
