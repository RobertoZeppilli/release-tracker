import { type CatalogEntry, type Source, sourceKey } from "./catalog-entry";

// `etag` is the Detection's validator for the last listing this Source served (null: never fetched).
export type StoredSource = Source & { id: string; etag: string | null };

// A Technology as the database holds it: a copy of its Catalog entry plus `retired` (ADR 0005).
export type StoredTechnology = Omit<CatalogEntry, "sources"> & {
  id: string;
  retired: boolean;
  sources: StoredSource[];
};

export type CatalogSyncOperation =
  | { type: "insert"; entry: CatalogEntry }
  | { type: "update"; technologyId: string; entry: CatalogEntry; removedSourceIds: string[] }
  // There is no "delete": a Technology is never deleted, only retired.
  | { type: "retire"; technologyId: string };

export function planCatalogSync(
  entries: readonly CatalogEntry[],
  stored: readonly StoredTechnology[],
): CatalogSyncOperation[] {
  const storedBySlug = new Map(stored.map((technology) => [technology.slug, technology]));
  const operations: CatalogSyncOperation[] = [];

  for (const entry of entries) {
    const technology = storedBySlug.get(entry.slug);
    if (!technology) {
      operations.push({ type: "insert", entry });
    } else if (!matches(entry, technology)) {
      operations.push({
        type: "update",
        technologyId: technology.id,
        entry,
        removedSourceIds: removedSourceIds(entry.sources, technology.sources),
      });
    }
  }

  const slugs = new Set(entries.map((entry) => entry.slug));
  for (const technology of stored) {
    if (!slugs.has(technology.slug) && !technology.retired) {
      operations.push({ type: "retire", technologyId: technology.id });
    }
  }
  return operations;
}

function removedSourceIds(sources: readonly Source[], storedSources: readonly StoredSource[]): string[] {
  const keys = new Set(sources.map(sourceKey));
  return storedSources.filter((source) => !keys.has(sourceKey(source))).map((source) => source.id);
}

function matches(entry: CatalogEntry, technology: StoredTechnology): boolean {
  return (
    !technology.retired &&
    entry.name === technology.name &&
    entry.description === technology.description &&
    entry.classificationStrategy === technology.classificationStrategy &&
    sameSources(entry.sources, technology.sources)
  );
}

function sameSources(sources: readonly Source[], storedSources: readonly StoredSource[]): boolean {
  if (sources.length !== storedSources.length) return false;
  const storedByKey = new Map(storedSources.map((source) => [sourceKey(source), source]));
  return sources.every((source) => {
    const match = storedByKey.get(sourceKey(source));
    return match !== undefined && canonical(match) === canonical(source);
  });
}

// Key order differs between a parsed file and a jsonb column, so compare sorted entries.
// `id` and `etag` belong to the database, not to the Catalog file: they never mean a Source changed.
function canonical(source: Source | StoredSource): string {
  const entries = Object.entries(source).filter(([key]) => key !== "id" && key !== "etag");
  return JSON.stringify(entries.sort(([a], [b]) => a.localeCompare(b)));
}
