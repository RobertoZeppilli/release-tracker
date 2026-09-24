import type { Source } from "@/modules/catalog";

export type DetectionSource = Extract<Source, { role: "detection" }>;
export type NotesSource = Extract<Source, { role: "notes" }>;

export type ObservedVersion = { version: string; publishedAt: Date };

// Release Notes exactly as the Source provides them.
export type FoundNotes = { body: string; url: string };

// What a detection Source reports, with the validator that lets the next run skip the download.
// `etag` is null when the Source offers none: then every run pays for the whole list.
export type VersionListing = { versions: ObservedVersion[]; etag: string | null };

// Every kind of Source is reached through this interface, by role; tests pass fakes.
export interface SourceAdapters {
  // An npm packument is megabytes and on most days it is yesterday's: given the `etag` of the last
  // listing, a Source that says nothing changed answers "unchanged" without sending a body.
  listVersions(source: DetectionSource, etag?: string | null): Promise<VersionListing | "unchanged">;
  // Versions without notes on the Source are missing from the result.
  findNotes(source: NotesSource, versions: readonly string[]): Promise<Map<string, FoundNotes>>;
}
