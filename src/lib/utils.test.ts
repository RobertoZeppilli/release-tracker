import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a DESIGN.md text size next to a text colour", () => {
    expect(cn("text-label", "text-text-muted")).toBe("text-label text-text-muted");
  });

  it("lets a later text size win", () => {
    expect(cn("text-label", "text-meta")).toBe("text-meta");
  });
});
