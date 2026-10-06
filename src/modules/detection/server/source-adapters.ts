import { z } from "zod";
import { extractChangelogSection, headingAnchor } from "../domain/changelog";
import type {
  DetectionSource,
  FoundNotes,
  NotesSource,
  ObservedVersion,
  SourceAdapters,
  VersionListing,
} from "../domain/source-adapters";
import { notesTagFor, versionFromTag } from "../domain/tag-format";
import { DEFAULT_RETRY_DELAYS_MS, retrying } from "./retrying";

type Fetch = typeof fetch;

export type SourceAdapterOptions = {
  githubToken?: string;
  fetch?: Fetch;
  // One delay per retry, so the schedule is the whole policy and a test can set it to nothing.
  retryDelaysMs?: readonly number[];
};

const NpmPackageSchema = z.object({
  versions: z.record(z.string(), z.unknown()),
  time: z.record(z.string(), z.iso.datetime()),
});

const GitHubReleasesSchema = z.array(
  z.object({
    tag_name: z.string(),
    body: z.string().nullable(),
    html_url: z.url(),
    draft: z.boolean(),
    published_at: z.iso.datetime().nullish(),
  }),
);

const PER_PAGE = 100;
// GitHub pages its release list where npm hands over the whole packument at once. Node has more
// than a thousand Releases and the Initial Import wants twelve months: three pages are years of
// them, and a bound is what keeps a detection run from walking a repository's entire history.
const MAX_PAGES = 3;

// Called only from server jobs, never from the client.
export function createSourceAdapters({
  githubToken,
  fetch = globalThis.fetch,
  retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
}: SourceAdapterOptions = {}): SourceAdapters {
  // Wrapped once here, so every call below retries without knowing it does.
  const ask = retrying(fetch, retryDelaysMs);
  return {
    async listVersions(source, etag) {
      switch (source.kind) {
        case "npm":
          return listNpmVersions(ask, source.package, etag);
        case "github-releases":
          return listGitHubVersions(ask, githubToken, source, etag);
      }
    },
    async findNotes(source, versions) {
      switch (source.kind) {
        case "github-releases":
          return findGitHubReleaseNotes(ask, githubToken, source, versions);
        case "changelog":
          return findChangelogNotes(ask, source, versions);
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

// The tag is the only place a GitHub Release spells its Version, and the list holds whatever else
// the repository tags: a tag that does not read back as a Version is somebody else's.
async function listGitHubVersions(
  fetch: Fetch,
  token: string | undefined,
  source: Extract<DetectionSource, { kind: "github-releases" }>,
  storedEtag: string | null | undefined,
): Promise<VersionListing | "unchanged"> {
  const headers = githubHeaders(token);
  const versions: ObservedVersion[] = [];
  let etag: string | null = null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://api.github.com/repos/${source.repo}/releases?per_page=${PER_PAGE}&page=${page}`;
    // Only the first page carries the validator: it holds the newest Releases, so a page that has
    // not moved means no Release was published, which is the whole question a detection run asks.
    const conditional = page === 1 && storedEtag ? { ...headers, "if-none-match": storedEtag } : headers;
    const response = await fetch(url, { headers: conditional });
    if (response.status === 304) return "unchanged";
    if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    if (page === 1) etag = response.headers.get("etag");

    const releases = GitHubReleasesSchema.parse(await response.json());
    for (const release of releases) {
      const version = versionFromTag(source.tagFormat, release.tag_name);
      // A draft has no date and no audience; a Release without one cannot be placed in time.
      if (version === null || release.draft || !release.published_at) continue;
      versions.push({ version, publishedAt: new Date(release.published_at) });
    }
    if (releases.length < PER_PAGE) break;
  }
  return { versions, etag };
}

// Walks the release list, newest first, until every wanted tag is found or the list ends.
async function findGitHubReleaseNotes(
  fetch: Fetch,
  token: string | undefined,
  source: Extract<NotesSource, { kind: "github-releases" }>,
  versions: readonly string[],
): Promise<Map<string, FoundNotes>> {
  // A Version whose tag cannot be written is left out: it would be a tag nobody published.
  const versionByTag = new Map(
    versions.flatMap((version) => {
      const tag = notesTagFor(source, version);
      return tag === null ? [] : [[tag, version] as const];
    }),
  );
  const headers = githubHeaders(token);

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

function githubHeaders(token: string | undefined): Record<string, string> {
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function getJson(fetch: Fetch, url: string, headers: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  return response.json();
}
