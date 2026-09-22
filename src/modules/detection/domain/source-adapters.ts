import type { Source } from "@/modules/catalog";

export type DetectionSource = Extract<Source, { role: "detection" }>;
export type NotesSource = Extract<Source, { role: "notes" }>;

export type ObservedVersion = { version: string; publishedAt: Date };

// Release Notes exactly as the Source provides them.
export type FoundNotes = { body: string; url: string };

// Every kind of Source is reached through this interface, by role; tests pass fakes.
export interface SourceAdapters {
  listVersions(source: DetectionSource): Promise<ObservedVersion[]>;
  // Versions without notes on the Source are missing from the result.
  findNotes(source: NotesSource, versions: readonly string[]): Promise<Map<string, FoundNotes>>;
}
