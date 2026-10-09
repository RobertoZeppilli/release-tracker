import { z } from "zod";
import type { DetectionSource, FoundNotes, NotesSource, ObservedVersion, VersionListing } from "../domain/source-adapters";
import { notesTagCandidates, versionFromAnyTagForm } from "../domain/tag-format";

type Fetch = typeof fetch;

const GitHubReleaseSchema = z.object({
  tag_name: z.string(),
  body: z.string().nullable(),
  html_url: z.url(),
  draft: z.boolean(),
  published_at: z.iso.datetime().nullish(),
});

const GitHubReleasesSchema = z.array(GitHubReleaseSchema);

type GitHubRelease = z.infer<typeof GitHubReleaseSchema>;

const PER_PAGE = 100;
// GitHub pages its release list where npm hands over the whole packument at once. Node has more
// than a thousand Releases and the Initial Import wants twelve months: three pages are years of
// them, and a bound is what keeps a detection run from walking a repository's entire history.
const MAX_PAGES = 3;

// The tag is the only place a GitHub Release spells its Version, and the list holds whatever else
// the repository tags: a tag that does not read back as a Version is somebody else's. Both forms of
// the declared format are read, so a repository that changes convention keeps being detected
// (`versionFromAnyTagForm`). A Version listed in both forms is one Release all the same: the caller
// keeps one date per Version, the earliest (`observeVersions`).
export async function listGitHubVersions(
  fetch: Fetch,
  token: string | undefined,
  source: Extract<DetectionSource, { kind: "github-releases" }>,
  storedEtag: string | null | undefined,
): Promise<VersionListing | "unchanged"> {
  const headers = githubHeaders(token);
  const versions: ObservedVersion[] = [];
  let etag: string | null = null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = releasesUrl(source.repo, page);
    // Only the first page carries the validator: it holds the newest Releases, so a page that has
    // not moved means no Release was published, which is the whole question a detection run asks.
    const conditional = page === 1 && storedEtag ? { ...headers, "if-none-match": storedEtag } : headers;
    const response = await fetch(url, { headers: conditional });
    if (response.status === 304) return "unchanged";
    if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    if (page === 1) etag = response.headers.get("etag");

    const releases = GitHubReleasesSchema.parse(await response.json());
    for (const release of releases) {
      const version = versionFromAnyTagForm(source.tagFormat, release.tag_name);
      // A draft has no date and no audience; a Release without one cannot be placed in time.
      if (version === null || release.draft || !release.published_at) continue;
      versions.push({ version, publishedAt: new Date(release.published_at) });
    }
    if (releases.length < PER_PAGE) break;
  }
  return { versions, etag };
}

// Walks the release list, newest first, until every wanted tag is found or the list ends, then asks
// for the tags still missing one by one. Every Version brings at most its two candidate tags, so the
// cost follows the Versions without notes and never the Releases already complete.
export async function findGitHubReleaseNotes(
  fetch: Fetch,
  token: string | undefined,
  source: Extract<NotesSource, { kind: "github-releases" }>,
  versions: readonly string[],
): Promise<Map<string, FoundNotes>> {
  // A Version whose tag cannot be written is left out: it would be a tag nobody published.
  const tagsByVersion = new Map<string, readonly string[]>();
  const versionByTag = new Map<string, string>();
  for (const version of versions) {
    const tags = notesTagCandidates(source, version);
    if (tags.length === 0) continue;
    tagsByVersion.set(version, tags);
    // The configured form is first, so it wins a tag the two forms would both claim.
    for (const tag of tags) if (!versionByTag.has(tag)) versionByTag.set(tag, version);
  }
  const headers = githubHeaders(token);

  const found = new Map<string, FoundNotes>();
  // A tag the list has already shown has nothing left to say: asking for it again would buy the
  // same draft or the same empty body a second time.
  const listed = new Set<string>();
  for (let page = 1; found.size < tagsByVersion.size; page++) {
    const releases = GitHubReleasesSchema.parse(await getJson(fetch, releasesUrl(source.repo, page), headers));
    for (const release of releases) {
      const version = versionByTag.get(release.tag_name);
      if (version === undefined) continue;
      listed.add(release.tag_name);
      if (found.has(version)) continue;
      const notes = notesOf(release);
      if (notes) found.set(version, notes);
    }
    if (releases.length < PER_PAGE) break;
  }

  // A release can be missing from the paginated list and still answer by its tag: `express`
  // publishes some that way, and its list stops months before them.
  for (const [version, tags] of tagsByVersion) {
    if (found.has(version)) continue;
    for (const tag of tags) {
      if (listed.has(tag)) continue;
      const notes = notesOf(await getGitHubReleaseByTag(fetch, source.repo, tag, headers));
      if (notes) {
        found.set(version, notes);
        break;
      }
    }
  }
  return found;
}

function releasesUrl(repo: string, page: number): string {
  return `https://api.github.com/repos/${repo}/releases?per_page=${PER_PAGE}&page=${page}`;
}

// An empty body is no notes at all; anything else is kept exactly as written.
function notesOf(release: GitHubRelease | null): FoundNotes | null {
  if (release === null || release.draft || !release.body?.trim()) return null;
  return { body: release.body, url: release.html_url };
}

// A 404 is the answer "no such tag here", not a failure: every other status still fails loudly.
async function getGitHubReleaseByTag(
  fetch: Fetch,
  repo: string,
  tag: string,
  headers: Record<string, string>,
): Promise<GitHubRelease | null> {
  const url = `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`;
  const response = await fetch(url, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  return GitHubReleaseSchema.parse(await response.json());
}

export function githubHeaders(token: string | undefined): Record<string, string> {
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function getJson(fetch: Fetch, url: string, headers: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  return response.json();
}
