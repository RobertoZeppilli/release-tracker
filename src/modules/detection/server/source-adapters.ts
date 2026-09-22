import { z } from "zod";
import type { FoundNotes, NotesSource, ObservedVersion, SourceAdapters } from "../domain/source-adapters";

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
    async listVersions(source) {
      switch (source.kind) {
        case "npm":
          return listNpmVersions(fetch, source.package);
      }
    },
    async findNotes(source, versions) {
      switch (source.kind) {
        case "github-releases":
          return findGitHubReleaseNotes(fetch, githubToken, source, versions);
      }
    },
  };
}

async function listNpmVersions(fetch: Fetch, name: string): Promise<ObservedVersion[]> {
  // A scoped name keeps its @ and encodes the slash.
  const url = `https://registry.npmjs.org/${encodeURIComponent(name).replace(/^%40/, "@")}`;
  const { versions, time } = NpmPackageSchema.parse(await getJson(fetch, url, {}));
  return Object.keys(versions).flatMap((version) => {
    const published = time[version];
    return published === undefined ? [] : [{ version, publishedAt: new Date(published) }];
  });
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

async function getJson(fetch: Fetch, url: string, headers: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  return response.json();
}
