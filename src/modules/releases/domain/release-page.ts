import type { StoredSummary } from "@/modules/summaries";
import type { SummaryStatus } from "./initial-summary-status";
import type { Significance } from "./significance";

export type ReleaseDetail = {
  version: string;
  significance: Significance;
  origin: "imported" | "detected";
  publishedAt: Date;
  recordedAt: Date;
  notes: { body: string; url: string | null } | null;
  summaryStatus: SummaryStatus | null;
  // Only for a `ready` Summary whose content validates.
  summary: StoredSummary | null;
};

// A Version may hold characters that are not safe in a path segment, such as `+` in build metadata.
export function releasePath(slug: string, version: string): string {
  return `/technologies/${slug}/${encodeURIComponent(version)}`;
}

// The inverse of `releasePath`: route params arrive still encoded. A malformed segment is no Version.
export function versionFromPath(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

// Release Notes are shown as stored, one numbered line each; trailing blank lines carry nothing.
export function noteLines(body: string): string[] {
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  return lines;
}
