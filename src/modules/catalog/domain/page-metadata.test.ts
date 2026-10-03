import { describe, expect, it } from "vitest";
import { technologyMeta } from "./page-metadata";

describe("technologyMeta", () => {
  it("names the Technology in the title", () => {
    expect(technologyMeta({ name: "Vite", description: "Frontend build tool" }).title).toBe("Vite releases");
  });

  it("follows the Catalog description with what the page holds", () => {
    expect(technologyMeta({ name: "Vite", description: "Frontend build tool" }).description).toBe(
      "Frontend build tool. Every Vite release, with a summary of what changed when there is one.",
    );
  });

  it("stands on its own when the Catalog has no description", () => {
    expect(technologyMeta({ name: "Vite", description: "" }).description).toBe(
      "Every Vite release, with a summary of what changed when there is one.",
    );
  });

  it("does not double the full stop of a description that has one", () => {
    expect(technologyMeta({ name: "Vite", description: "Frontend build tool." }).description).toContain(
      "build tool. Every",
    );
  });
});
