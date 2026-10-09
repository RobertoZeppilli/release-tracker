import { describe, expect, it } from "vitest";
import { createSourceAdapters } from "./source-adapters";

function fakeFetch(responses: Record<string, unknown>, etag?: string) {
  const requested: { url: string; headers: HeadersInit | undefined }[] = [];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    requested.push({ url, headers: init?.headers });
    if (etag !== undefined && headers.get("if-none-match") === etag) return new Response(null, { status: 304 });
    if (!(url in responses)) return new Response("not found", { status: 404 });
    return Response.json(responses[url], etag === undefined ? undefined : { headers: { etag } });
  };
  return { fetch, requested };
}

const github = { role: "notes", kind: "github-releases", repo: "vitejs/vite", tagFormat: "v{version}" } as const;

function githubRelease(tag: string, body: string | null, draft = false, publishedAt: string | null = "2026-03-12T10:00:00Z") {
  return {
    tag_name: tag,
    body,
    draft,
    published_at: publishedAt,
    html_url: `https://github.com/vitejs/vite/releases/tag/${tag}`,
  };
}

describe("npm adapter", () => {
  it("lists every Version with its publish date", async () => {
    const { fetch, requested } = fakeFetch({
      "https://registry.npmjs.org/@vitejs%2Fplugin-react": {
        versions: { "5.0.0": {}, "5.0.1-beta.0": {} },
        time: { created: "2020-01-01T00:00:00.000Z", "5.0.0": "2026-03-12T10:00:00.000Z", "5.0.1-beta.0": "2026-03-13T10:00:00.000Z" },
      },
    });
    const listing = await createSourceAdapters({ fetch }).listVersions({
      role: "detection",
      kind: "npm",
      package: "@vitejs/plugin-react",
    });
    expect(listing).toEqual({
      etag: null,
      versions: [
        { version: "5.0.0", publishedAt: new Date("2026-03-12T10:00:00.000Z") },
        { version: "5.0.1-beta.0", publishedAt: new Date("2026-03-13T10:00:00.000Z") },
      ],
    });
    expect(requested.map((request) => request.url)).toEqual(["https://registry.npmjs.org/@vitejs%2Fplugin-react"]);
  });

  // The whole point of the daily Detection: the packument is megabytes, the 304 is nothing.
  it("asks with the stored validator and reports that nothing changed", async () => {
    const packument = { versions: { "5.0.0": {} }, time: { "5.0.0": "2026-03-12T10:00:00.000Z" } };
    const { fetch, requested } = fakeFetch({ "https://registry.npmjs.org/vite": packument }, '"abc"');
    const npm = { role: "detection", kind: "npm", package: "vite" } as const;

    const first = await createSourceAdapters({ fetch }).listVersions(npm, null);
    expect(first).toEqual({ etag: '"abc"', versions: [{ version: "5.0.0", publishedAt: new Date("2026-03-12T10:00:00.000Z") }] });

    expect(await createSourceAdapters({ fetch }).listVersions(npm, '"abc"')).toBe("unchanged");
    expect(new Headers(requested[1]?.headers).get("if-none-match")).toBe('"abc"');
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

// Bun, Node and PHP publish no package: their Releases are the list, and the tag is the Version.
describe("GitHub Releases as a detection Source", () => {
  const bun = { role: "detection", kind: "github-releases", repo: "oven-sh/bun", tagFormat: "bun-v{version}" } as const;
  const page = (n: number) => `https://api.github.com/repos/oven-sh/bun/releases?per_page=100&page=${n}`;

  it("reads the Version out of the tag and skips whatever is not one", async () => {
    const { fetch } = fakeFetch({
      [page(1)]: [
        githubRelease("bun-v1.4.2", "### Features"),
        githubRelease("bun-v1.4.1", null),
        githubRelease("bun-v1.4.0-canary.3", "x"),
        githubRelease("bun-types-v1.4.0", "x"),
        githubRelease("bun-v1.3.9", "x", true),
        githubRelease("bun-v1.3.8", "x", false, null),
      ],
    });
    const listing = await createSourceAdapters({ fetch, githubToken: "token" }).listVersions(bun);
    expect(listing).toEqual({
      etag: null,
      versions: [
        // Notes are the other Source's job: a Release with none is still a Release.
        { version: "1.4.2", publishedAt: new Date("2026-03-12T10:00:00Z") },
        { version: "1.4.1", publishedAt: new Date("2026-03-12T10:00:00Z") },
        { version: "1.4.0-canary.3", publishedAt: new Date("2026-03-12T10:00:00Z") },
      ],
    });
  });

  it("asks the first page with the stored validator and reports that nothing changed", async () => {
    const { fetch, requested } = fakeFetch({ [page(1)]: [githubRelease("bun-v1.4.2", "x")] }, '"abc"');
    expect(await createSourceAdapters({ fetch }).listVersions(bun, null)).toEqual({
      etag: '"abc"',
      versions: [{ version: "1.4.2", publishedAt: new Date("2026-03-12T10:00:00Z") }],
    });
    expect(await createSourceAdapters({ fetch }).listVersions(bun, '"abc"')).toBe("unchanged");
    expect(new Headers(requested[1]?.headers).get("if-none-match")).toBe('"abc"');
  });

  // Node has more than a thousand Releases: without the bound, one Technology would walk them all.
  it("stops after three pages however long the history is", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => githubRelease(`bun-v1.0.${i}`, "x"));
    const { fetch, requested } = fakeFetch({ [page(1)]: fullPage, [page(2)]: fullPage, [page(3)]: fullPage, [page(4)]: fullPage });
    const listing = await createSourceAdapters({ fetch }).listVersions(bun);
    expect(listing).not.toBe("unchanged");
    expect(requested).toHaveLength(3);
  });

  it("fails loudly when the repository does", async () => {
    const { fetch } = fakeFetch({});
    await expect(createSourceAdapters({ fetch }).listVersions(bun)).rejects.toThrow(/404/);
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

// A 504 on one page of electron's releases failed the whole Catalog import on 2026-10-06.
describe("a Source that fails for a moment", () => {
  const bun = { role: "detection", kind: "github-releases", repo: "oven-sh/bun", tagFormat: "bun-v{version}" } as const;
  const releases = [githubRelease("bun-v1.4.2", "x")];
  const version = { etag: null, versions: [{ version: "1.4.2", publishedAt: new Date("2026-03-12T10:00:00Z") }] };

  // One entry per answer, in order: a status to answer with, or null for a connection that never
  // opened. Past the last entry the Source is itself again.
  function failingFetch(answers: readonly (number | null)[]) {
    let asked = 0;
    const fetch: typeof globalThis.fetch = async () => {
      const answer = answers[asked++];
      if (answer === undefined) return Response.json(releases);
      if (answer === null) throw new TypeError("fetch failed");
      return new Response("nope", { status: answer });
    };
    return { fetch, asked: () => asked };
  }

  function adapters(answers: readonly (number | null)[]) {
    const { fetch, asked } = failingFetch(answers);
    return { listVersions: createSourceAdapters({ fetch, retryDelaysMs: [0, 0] }).listVersions, asked };
  }

  it("asks again, and the second answer is the Releases", async () => {
    const { listVersions, asked } = adapters([504]);
    expect(await listVersions(bun)).toEqual(version);
    expect(asked()).toBe(2);
  });

  it("asks again when the connection never opened", async () => {
    const { listVersions, asked } = adapters([null]);
    expect(await listVersions(bun)).toEqual(version);
    expect(asked()).toBe(2);
  });

  // Two delays, so three asks in all, and the last failure is the one the job reports.
  it("gives up after the last delay and fails loudly", async () => {
    const { listVersions, asked } = adapters([504, 503, 500]);
    await expect(listVersions(bun)).rejects.toThrow(/500/);
    expect(asked()).toBe(3);
  });

  // A 4xx is an answer, not a moment: asking again inside seconds only repeats it.
  it("takes a refusal for an answer and asks once", async () => {
    for (const status of [404, 429]) {
      const { listVersions, asked } = adapters([status, status, status]);
      await expect(listVersions(bun)).rejects.toThrow(new RegExp(String(status)));
      expect(asked()).toBe(1);
    }
  });
});

// The three cases of #137, each measured on GitHub on 2026-10-09: `angular` tagged `21.0.3` in 2025
// and tags `v21.0.3` today, `drizzle-orm` did the opposite, and `express` publishes releases its own
// paginated list does not contain.
describe("a repository that changed how it writes tags", () => {
  function githubApi(repo: string) {
    return {
      page: (n: number) => `https://api.github.com/repos/${repo}/releases?per_page=100&page=${n}`,
      byTag: (tag: string) => `https://api.github.com/repos/${repo}/releases/tags/${tag}`,
      release: (tag: string, body: string | null = "### Breaking Changes") => ({
        tag_name: tag,
        body,
        draft: false,
        published_at: "2025-12-03T10:00:00Z",
        html_url: `https://github.com/${repo}/releases/tag/${tag}`,
      }),
    };
  }

  it("reads the older era out of the list it is already walking", async () => {
    const { page, release } = githubApi("angular/angular");
    const angular = { role: "notes", kind: "github-releases", repo: "angular/angular", tagFormat: "v{version}" } as const;
    const { fetch, requested } = fakeFetch({ [page(1)]: [release("v21.0.4"), release("21.0.3")] });

    const notes = await createSourceAdapters({ fetch }).findNotes(angular, ["21.0.4", "21.0.3"]);
    expect([...notes.keys()]).toEqual(["21.0.4", "21.0.3"]);
    expect(notes.get("21.0.3")?.url).toBe("https://github.com/angular/angular/releases/tag/21.0.3");
    // Both tags were in the list: nothing had to be asked tag by tag.
    expect(requested).toHaveLength(1);
  });

  // The same trouble the other way round, and the one that is still bleeding: every new Release of
  // drizzle is tagged in a form the Catalog does not know.
  it("reads the newer era too, when the Catalog holds the older one", async () => {
    const { page, release } = githubApi("drizzle-team/drizzle-orm");
    const drizzle = { role: "notes", kind: "github-releases", repo: "drizzle-team/drizzle-orm", tagFormat: "{version}" } as const;
    const { fetch } = fakeFetch({ [page(1)]: [release("v1.0.0-rc.4"), release("0.44.6")] });

    const notes = await createSourceAdapters({ fetch }).findNotes(drizzle, ["1.0.0-rc.4", "0.44.6"]);
    expect([...notes.keys()]).toEqual(["1.0.0-rc.4", "0.44.6"]);
  });

  it("asks for the tag directly when the release is missing from the list", async () => {
    const { page, byTag, release } = githubApi("expressjs/express");
    const express = { role: "notes", kind: "github-releases", repo: "expressjs/express", tagFormat: "v{version}" } as const;
    const { fetch, requested } = fakeFetch({
      [page(1)]: [release("v5.2.0")],
      [byTag("v4.22.3")]: release("v4.22.3", "Fixed a regression"),
    });

    const notes = await createSourceAdapters({ fetch }).findNotes(express, ["4.22.3"]);
    expect(notes.get("4.22.3")?.body).toBe("Fixed a regression");
    // One page, then the configured form, which answered: the other form was never asked.
    expect(requested.map((request) => request.url)).toEqual([page(1), byTag("v4.22.3")]);
  });

  // A draft, and an empty body, are both the list saying there is nothing there.
  it("does not ask again for a tag the list has already shown", async () => {
    const { page, byTag, release } = githubApi("expressjs/express");
    const express = { role: "notes", kind: "github-releases", repo: "expressjs/express", tagFormat: "v{version}" } as const;
    const empty = { ...release("v5.2.0"), body: "   " };
    const draft = { ...release("v5.1.0"), draft: true };
    const { fetch, requested } = fakeFetch({ [page(1)]: [empty, draft] });

    const notes = await createSourceAdapters({ fetch }).findNotes(express, ["5.2.0", "5.1.0"]);
    expect(notes.size).toBe(0);
    // Only the other form of each tag is left to ask: the two the list showed are not asked again.
    expect(requested.map((request) => request.url)).toEqual([page(1), byTag("5.2.0"), byTag("5.1.0")]);
  });

  it("tries both forms and gives up on a Version nobody published, without failing", async () => {
    const { page, byTag, release } = githubApi("expressjs/express");
    const express = { role: "notes", kind: "github-releases", repo: "expressjs/express", tagFormat: "v{version}" } as const;
    const { fetch, requested } = fakeFetch({ [page(1)]: [release("v5.2.0")] });

    const notes = await createSourceAdapters({ fetch }).findNotes(express, ["4.22.3"]);
    expect(notes.size).toBe(0);
    // Two candidate tags, two questions, and a 404 is an answer and not a failure.
    expect(requested.map((request) => request.url)).toEqual([page(1), byTag("v4.22.3"), byTag("4.22.3")]);
  });
});
