import { z } from "zod";
import { extractChangelogSection, headingAnchor } from "../domain/changelog";
import type { FoundNotes, NotesSource, SourceAdapters, VersionListing } from "../domain/source-adapters";
import { findGitHubReleaseNotes, listGitHubVersions } from "./github-api";
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
