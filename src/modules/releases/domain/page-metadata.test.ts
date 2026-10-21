import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import { releaseMeta } from "./page-metadata";
import type { ReleaseDetail } from "./release-page";

const release: ReleaseDetail = {
  version: "6.0.0",
  significance: "featured",
  origin: "detected",
  publishedAt: new Date("2026-01-13T09:30:00Z"),
  recordedAt: new Date("2026-01-14T02:00:00Z"),
  notes: null,
  summaryStatus: "pending", unjudged: false,
  summary: null,
};

const summary = {
  content: {
    title: "The Environment API replaces the SSR entry points",
    keyPoints: [{ text: "a" }, { text: "b" }, { text: "c" }],
    breakingChanges: [{ change: "The SSR entry is gone", migration: "Use the Environment API." }],
    actionRequired: true,
  },
  model: "claude-opus-5",
  promptVersion: "1",
};

const t = createTranslator("en", dictionaryFor("en"));

describe("releaseMeta", () => {
  it("names the Technology and the Version in the title", () => {
    expect(releaseMeta("Vite", release, t).title).toBe("Vite 6.0.0 release");
  });

  it("describes a Release with a Summary with the Summary title and nothing else", () => {
    expect(releaseMeta("Vite", { ...release, summaryStatus: "ready", summary }, t).description).toBe(
      "The Environment API replaces the SSR entry points",
    );
  });

  it("describes a Release without a Summary with the day it was published", () => {
    expect(releaseMeta("Vite", release, t).description).toBe("Vite 6.0.0, published 2026-01-13.");
  });

  it("says the notes are not summarized yet when a Release without a Summary has notes", () => {
    const withNotes = { ...release, notes: { body: "Fixes a crash.", url: null } };
    expect(releaseMeta("Vite", withNotes, t).description).toBe(
      "Vite 6.0.0, published 2026-01-13. The release notes as published, not yet summarized.",
    );
  });
});
