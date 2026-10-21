import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import { technologyMeta } from "./page-metadata";

const t = createTranslator("en", dictionaryFor("en"));

describe("technologyMeta", () => {
  it("names the Technology in the title", () => {
    expect(technologyMeta({ name: "Vite", description: "Frontend build tool" }, t).title).toBe("Vite releases");
  });

  it("follows the Catalog description with what the page holds", () => {
    expect(technologyMeta({ name: "Vite", description: "Frontend build tool" }, t).description).toBe(
      "Frontend build tool. Every Vite release, with a summary of what changed when there is one.",
    );
  });

  it("stands on its own when the Catalog has no description", () => {
    expect(technologyMeta({ name: "Vite", description: "" }, t).description).toBe(
      "Every Vite release, with a summary of what changed when there is one.",
    );
  });

  it("does not double the full stop of a description that has one", () => {
    expect(technologyMeta({ name: "Vite", description: "Frontend build tool." }, t).description).toContain(
      "build tool. Every",
    );
  });
});
