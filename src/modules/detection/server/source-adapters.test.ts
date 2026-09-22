import { describe, expect, it } from "vitest";
import { createSourceAdapters } from "./source-adapters";

function fakeFetch(responses: Record<string, unknown>) {
  const requested: { url: string; headers: HeadersInit | undefined }[] = [];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = String(input);
    requested.push({ url, headers: init?.headers });
    return url in responses ? Response.json(responses[url]) : new Response("not found", { status: 404 });
  };
  return { fetch, requested };
}

const github = { role: "notes", kind: "github-releases", repo: "vitejs/vite", tagFormat: "v{version}" } as const;

function githubRelease(tag: string, body: string | null, draft = false) {
  return { tag_name: tag, body, draft, html_url: `https://github.com/vitejs/vite/releases/tag/${tag}` };
}

describe("npm adapter", () => {
  it("lists every Version with its publish date", async () => {
    const { fetch, requested } = fakeFetch({
      "https://registry.npmjs.org/@vitejs%2Fplugin-react": {
        versions: { "5.0.0": {}, "5.0.1-beta.0": {} },
        time: { created: "2020-01-01T00:00:00.000Z", "5.0.0": "2026-03-12T10:00:00.000Z", "5.0.1-beta.0": "2026-03-13T10:00:00.000Z" },
      },
    });
    const versions = await createSourceAdapters({ fetch }).listVersions({
      role: "detection",
      kind: "npm",
      package: "@vitejs/plugin-react",
    });
    expect(versions).toEqual([
      { version: "5.0.0", publishedAt: new Date("2026-03-12T10:00:00.000Z") },
      { version: "5.0.1-beta.0", publishedAt: new Date("2026-03-13T10:00:00.000Z") },
    ]);
    expect(requested.map((request) => request.url)).toEqual(["https://registry.npmjs.org/@vitejs%2Fplugin-react"]);
  });

  it("fails loudly when the registry does", async () => {
    const { fetch } = fakeFetch({});
    await expect(
      createSourceAdapters({ fetch }).listVersions({ role: "detection", kind: "npm", package: "missing" }),
    ).rejects.toThrow(/404/);
  });
});

describe("GitHub Releases adapter", () => {
  const page = (n: number) => `https://api.github.com/repos/vitejs/vite/releases?per_page=100&page=${n}`;

  it("matches tags through the tag format and keeps the notes as written", async () => {
    const { fetch, requested } = fakeFetch({
      [page(1)]: [
        githubRelease("create-vite@9.2.1", "### Bug Fixes"),
        githubRelease("v8.3.0", "### Features\r\n\r\n* faster preload\n"),
        githubRelease("v8.2.0", "   "),
        githubRelease("v8.1.0", "### Draft", true),
      ],
    });
    const notes = await createSourceAdapters({ fetch, githubToken: "token" }).findNotes(github, [
      "8.3.0",
      "8.2.0",
      "8.1.0",
      "9.2.1",
    ]);
    expect([...notes]).toEqual([
      ["8.3.0", { body: "### Features\r\n\r\n* faster preload\n", url: "https://github.com/vitejs/vite/releases/tag/v8.3.0" }],
    ]);
    expect(requested[0].headers).toMatchObject({ authorization: "Bearer token" });
  });

  it("reads further pages until every Version is found", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => githubRelease(`create-vite@1.0.${i}`, "x"));
    const { fetch, requested } = fakeFetch({
      [page(1)]: fullPage,
      [page(2)]: [githubRelease("v7.0.0", "### Breaking Changes")],
    });
    const notes = await createSourceAdapters({ fetch }).findNotes(github, ["7.0.0"]);
    expect(notes.get("7.0.0")?.body).toBe("### Breaking Changes");
    expect(requested).toHaveLength(2);
  });
});

describe("CHANGELOG.md adapter", () => {
  const changelog = { role: "notes", kind: "changelog", repo: "facebook/react", path: "CHANGELOG.md" } as const;
  const raw = "https://raw.githubusercontent.com/facebook/react/HEAD/CHANGELOG.md";

  it("reads the file once and links each section by its anchor", async () => {
    const { fetch, requested } = fakeFetch({});
    const withFile: typeof globalThis.fetch = async (input, init) =>
      String(input) === raw ? new Response("## 19.2.1 (Dec 3, 2025)\n\n- Fix\n\n## 19.2.0\n\n- Feature\n") : fetch(input, init);
    const notes = await createSourceAdapters({ fetch: withFile }).findNotes(changelog, ["19.2.1", "19.2.0", "19.3.0"]);
    expect([...notes]).toEqual([
      ["19.2.1", { body: "- Fix", url: "https://github.com/facebook/react/blob/HEAD/CHANGELOG.md#1921-dec-3-2025" }],
      ["19.2.0", { body: "- Feature", url: "https://github.com/facebook/react/blob/HEAD/CHANGELOG.md#1920" }],
    ]);
    expect(requested).toHaveLength(0);
  });

  it("fails loudly when the file is missing", async () => {
    const { fetch } = fakeFetch({});
    await expect(createSourceAdapters({ fetch }).findNotes(changelog, ["19.2.0"])).rejects.toThrow(/404/);
  });
});
