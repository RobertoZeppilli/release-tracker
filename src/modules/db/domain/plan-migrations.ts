// The data file lives on someone else's disk and outlives any one build of the app, so the two can
// disagree: a newer build may have run migrations this one has never heard of, and a migration may
// be added with a name that sorts before one already applied. Both leave two installs with
// different schemas under the same version, which is the failure a version table exists to prevent.
export class MigrationOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MigrationOrderError";
  }
}

// Which migrations still have to run, in the order they have to run in. Pure: the caller reads the
// directory and the version table, this decides.
export function planMigrations(available: readonly string[], applied: readonly string[]): string[] {
  const ordered = [...available].sort();
  const done = new Set(applied);

  const unknown = [...applied].filter((name) => !ordered.includes(name)).sort();
  if (unknown.length > 0) {
    throw new MigrationOrderError(
      `the data file has migrations this version of the app does not know: ${unknown.join(", ")}. ` +
        "It was written by a newer version; install that one again, or move the file aside.",
    );
  }

  const newest = ordered.filter((name) => done.has(name)).at(-1);
  const pending = ordered.filter((name) => !done.has(name));

  const late = newest === undefined ? [] : pending.filter((name) => name < newest);
  if (late.length > 0) {
    throw new MigrationOrderError(
      `these migrations come before ones already applied: ${late.join(", ")}. ` +
        "Renaming them so they sort last is what keeps every install on the same schema.",
    );
  }

  return pending;
}
