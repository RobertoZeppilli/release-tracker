import { z } from "zod";
import { extractChangelogSection, headingAnchor } from "../domain/changelog";
import type { FoundNotes, NotesSource, SourceAdapters, VersionListing } from "../domain/source-adapters";

type Fetch = typeof fetch;

export type SourceAdapterOptions = { githubToken?: string; fetch?: Fetch };

const NpmPackageSchema = z.object({
  versions: z.record(z.string(), z.unknown()),
  time: z.record(z.string(), z.iso.datetime()),
});

const GitHubReleasesSchema = z.array(
  z.object({ tag_name: z.string(), body: z.string().nullable(), html_url: z.url(), draft: z.boolean() }),
);

const PER_PAGE = 100;

// Called only from server jobs, never from the client.
export function createSourceAdapters({ githubToken, fetch = globalThis.fetch }: SourceAdapterOptions = {}): SourceAdapters {
  return {
    async listVersions(source, etag) {
      switch (source.kind) {
        case "npm":
          return listNpmVersions(fetch, source.package, etag);
      }
    },
    async findNotes(source, versions) {
      switch (source.kind) {
        case "github-releases":
          return findGitHubReleaseNotes(fetch, githubToken, source, versions);
        case "changelog":
          return findChangelogNotes(fetch, source, versions);
      }
    },
  };
}

async function listNpmVersions(
  fetch: Fetch,
  name: string,
  etag: string | null | undefined,
): Promise<VersionListing | "unchanged"> {
  // A scoped name keeps its @ and encodes the slash.
  const url = `https://registry.npmjs.org/${encodeURIComponent(name).replace(/^%40/, "@")}`;
  const response = await fetch(url, { headers: etag ? { "if-none-match": etag } : {} });
  if (response.status === 304) return "unchanged";
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);

  const { versions, time } = NpmPackageSchema.parse(await response.json());
  return {
    etag: response.headers.get("etag"),
    versions: Object.keys(versions).flatMap((version) => {
      const published = time[version];
      return published === undefined ? [] : [{ version, publishedAt: new Date(published) }];
    }),
  };
}

// Walks the release list, newest first, until every wanted tag is found or the list ends.
async function findGitHubReleaseNotes(
  fetch: Fetch,
  token: string | undefined,
  source: Extract<NotesSource, { kind: "github-releases" }>,
  versions: readonly string[],
): Promise<Map<string, FoundNotes>> {
  const versionByTag = new Map(versions.map((version) => [source.tagFormat.replace("{version}", version), version]));
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };
  if (token) headers.authorization = `Bearer ${token}`;

  const found = new Map<string, FoundNotes>();
  for (let page = 1; found.size < versionByTag.size; page++) {
    const url = `https://api.github.com/repos/${source.repo}/releases?per_page=${PER_PAGE}&page=${page}`;
    const releases = GitHubReleasesSchema.parse(await getJson(fetch, url, headers));
    for (const release of releases) {
      const version = versionByTag.get(release.tag_name);
      // An empty body is no notes at all; anything else is kept exactly as written.
      if (version === undefined || release.draft || !release.body?.trim()) continue;
      found.set(version, { body: release.body, url: release.html_url });
    }
    if (releases.length < PER_PAGE) break;
  }
  return found;
}

// The raw file is served without the API's rate limit; HEAD is the default branch.
async function findChangelogNotes(
  fetch: Fetch,
  source: Extract<NotesSource, { kind: "changelog" }>,
  versions: readonly string[],
): Promise<Map<string, FoundNotes>> {
  const response = await fetch(`https://raw.githubusercontent.com/${source.repo}/HEAD/${source.path}`);
  if (!response.ok) throw new Error(`GET ${response.url || source.path} failed: ${response.status} ${response.statusText}`);
  const markdown = await response.text();
  const found = new Map<string, FoundNotes>();
  for (const version of versions) {
    const section = extractChangelogSection(markdown, version);
    if (!section) continue;
    const url = `https://github.com/${source.repo}/blob/HEAD/${source.path}#${headingAnchor(section.heading)}`;
    found.set(version, { body: section.body, url });
  }
  return found;
}

async function getJson(fetch: Fetch, url: string, headers: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  return response.json();
}
