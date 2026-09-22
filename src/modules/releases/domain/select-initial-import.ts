import type { Significance } from "./significance";

export type ImportCandidate = { version: string; significance: Significance; publishedAt: Date };

const DAY_MS = 24 * 60 * 60 * 1000;

// The Initial Import keeps the last 12 months plus the latest featured Release. Only that Release
// and the notable ones of the last 90 days get a Summary; the rest is History.
export function selectInitialImport<T extends ImportCandidate>(
  releases: readonly T[],
  now: Date,
): (T & { history: boolean })[] {
  const since = monthsBefore(now, 12);
  const summarizeSince = new Date(now.getTime() - 90 * DAY_MS);
  const latestFeatured = latest(releases.filter((release) => release.significance === "featured"));

  return releases
    .filter((release) => release.publishedAt >= since || release === latestFeatured)
    .map((release) => {
      const summarized =
        release === latestFeatured || (release.significance === "notable" && release.publishedAt >= summarizeSince);
      return { ...release, history: !summarized };
    });
}

function latest<T extends ImportCandidate>(releases: readonly T[]): T | undefined {
  return releases.reduce<T | undefined>(
    (found, release) => (found === undefined || release.publishedAt > found.publishedAt ? release : found),
    undefined,
  );
}

function monthsBefore(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() - months);
  return result;
}
