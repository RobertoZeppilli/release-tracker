import { describe, expect, it } from "vitest";
import { NOTES_HEAD_LENGTH, notesHead, notesJudgeable } from "./notes-judgement";

// Every string below is the stored body of a real Release in the Catalogue, so the rule is measured
// against the notes it will meet instead of invented ones.
const POINTS_ELSEWHERE = {
  "vite 8.0.0": "Please refer to [CHANGELOG.md](https://github.com/vitejs/vite/blob/v8.0.0/packages/vite/CHANGELOG.md) for details.",
  "webpack 5.0.0": "[Announcement and changelog](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)",
  "prettier 3.7.0":
    "[diff](https://github.com/prettier/prettier/compare/3.6.2...3.7.0)\r\n\r\n🔗 [Release note](https://prettier.io/blog/2025/11/27/3.7.0)",
  "trpc 11.0.0":
    "👉 **See the blog post @  https://trpc.io/blog/announcing-trpc-11**\r\n\r\n---\r\n\r\n## What's Changed\r\n\r\n**Full Changelog**: https://github.com/trpc/trpc/compare/v10.45.0...v11.0.0",
  "fastify 5.8.4": "**Full Changelog**: https://github.com/fastify/fastify/compare/v5.8.3...v5.8.4",
  "prettier 3.9.5": "🔗 [Changelog](https://github.com/prettier/prettier/blob/3.9.5/CHANGELOG.md#395)",
  "storybook 10.1.0-beta.0": "## 10.1.0-beta.0\n\n",
  "zod 4.2.1": "## Commits:\n\n- 5b5b129315fbc94a3b0d6244185eaeefcbe438d1 4.2.1",
  "next 15.3.6": "Please see [CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478) for additional details about this release.",
};

const DESCRIBES_CHANGES = {
  "svelte 5.44.0": "### Minor Changes\n\n-   feat: `hydratable` API ([#17154](https://github.com/sveltejs/svelte/pull/17154))\n",
  "drizzle 0.44.6": "- feat: add $replicas reference #4874\n",
  "electron 39.2.3": "# Release Notes for v39.2.3\r\n\r\n* Updated Chromium to 142.0.7444.175.",
  "storybook 9.1.20": "## 9.1.20\n\n- Add request validation\n",
  "sveltekit 2.56.1": "### Patch Changes\n\n-   chore: update JSDoc ([#15640](https://github.com/sveltejs/kit/pull/15640))\n",
  "deno 2.7.1": "### 2.7.1 / 2026.02.25\r\n\r\nThis is a maintenance release to fix wrong output of `deno --version` in v2.7.0.",
};

// Notes that state there are no changes say something, so their "no action required" is earned.
const DECLARES_NO_CHANGES = {
  "angular 21.1.5": "No user facing changes in this release",
  "storybook 9.1.18": "## 9.1.18\n\n- No-op release. No changes.\n",
  "vitest 4.0.0-beta.15":
    "*No significant changes*\n\n##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/vitest-dev/vitest/compare/v4.0.0-beta.14...v4.0.0-beta.15)",
  "next 16.2.8": "Release with no changes in an attempt to fix `next@latest` pointing at a prerelease version.",
};

describe("notesJudgeable", () => {
  it("has nothing to judge without notes", () => {
    expect(notesJudgeable(null)).toBe(false);
  });

  for (const [release, body] of Object.entries(POINTS_ELSEWHERE)) {
    it(`finds no judgement in notes that only point elsewhere: ${release}`, () => {
      expect(notesJudgeable(notesHead(body))).toBe(false);
    });
  }

  for (const [release, body] of Object.entries({ ...DESCRIBES_CHANGES, ...DECLARES_NO_CHANGES })) {
    it(`judges notes that say something: ${release}`, () => {
      expect(notesJudgeable(notesHead(body))).toBe(true);
    });
  }

  it("judges notes too long to be a pointer without reading them", () => {
    expect(notesJudgeable(notesHead("x".repeat(NOTES_HEAD_LENGTH + 1)))).toBe(true);
  });

  it("carries one character over the cap, so a capped head is told from a whole one", () => {
    expect(notesHead("x".repeat(5000)).head).toHaveLength(NOTES_HEAD_LENGTH + 1);
    expect(notesJudgeable({ head: "x".repeat(NOTES_HEAD_LENGTH) })).toBe(true);
  });

  it("keeps a sentence that points at nothing a description", () => {
    expect(notesJudgeable(notesHead("See the new `--flag` option"))).toBe(true);
  });

  it("reads an unknown way of pointing as a description rather than muting a verdict", () => {
    expect(notesJudgeable(notesHead("Consult the release engineering portal (https://example.com)"))).toBe(true);
  });
});
