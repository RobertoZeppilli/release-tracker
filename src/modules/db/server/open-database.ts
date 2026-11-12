import "server-only";

import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { databaseFile } from "../domain/database-file";
import { MigrationOrderError, planMigrations } from "../domain/plan-migrations";

export type Database = DatabaseSync;

// ⚠️ Resolved from this file, so it holds while the module is read as source: the tests, a script
// run with `tsx`, `next dev`. **It is not yet proved against a bundled build**, where this file
// becomes a chunk under `.next/` and `import.meta.url` points there instead of at `src/`. Nothing in
// the app opens the database yet, so there is nothing to prove it on; the first route that does must
// check it, and `outputFileTracingIncludes` in `next.config.ts` is only half the answer -- it ships
// the files, it does not say where this module will look for them.
export const MIGRATIONS_DIRECTORY = fileURLToPath(new URL("../migrations/", import.meta.url));

export type OpenOptions = {
  /** The file to open. Defaults to the place the installing system keeps application data. */
  file?: string;
  migrations?: string;
};

// The data file of one install (issue #211, ADR 0011): opened, brought up to the schema this build
// expects, and handed back. The app has no server, so this runs on the reader's own machine and the
// migrations run at startup rather than from a deploy.
export function openDatabase({ file, migrations = MIGRATIONS_DIRECTORY }: OpenOptions = {}): Database {
  const path = file ?? defaultDatabaseFile();
  mkdirSync(dirname(path), { recursive: true });

  const database = new DatabaseSync(path);
  // Off by default in SQLite, and every `references` in the schema is dead without it.
  database.exec("pragma foreign_keys = on");
  // The read of a page and the write of the Detection no longer wait on each other, which is what a
  // long job in the background does to an interface on the same file.
  database.exec("pragma journal_mode = wal");
  database.exec("pragma busy_timeout = 5000");

  try {
    migrate(database, migrations);
  } catch (error) {
    database.close();
    throw error;
  }
  return database;
}

export function defaultDatabaseFile(): string {
  return databaseFile({ platform: process.platform, home: homedir(), env: process.env, cwd: process.cwd() });
}

function migrate(database: Database, directory: string): void {
  database.exec(
    "create table if not exists schema_migrations (name text primary key, applied_at text not null)",
  );

  const available = readdirSync(directory).filter((name) => name.endsWith(".sql"));

  // ⚠️ `immediate`, and the version table read **inside** it. Two processes start on this file at
  // once -- `next dev` and a job run with `tsx` is the ordinary case -- and a plain `begin` takes a
  // read snapshot: both read an empty `schema_migrations`, both decide to apply the same file, and
  // the second one dies either on `table technologies already exists` or on `database is locked`,
  // which `busy_timeout` cannot save because a snapshot cannot be upgraded to a write. `immediate`
  // asks for the write lock at `begin`, so the second process waits there and then reads a version
  // table that already says what the first one did.
  //
  // One transaction for the whole run, not one per file: a failure half way leaves the schema where
  // it was, which is what the next start needs to try again, and whether that start re-runs one
  // file or four changes nothing it can see. ⚠️ `exec` cannot run inside a prepared statement,
  // hence the explicit begin/commit.
  database.exec("begin immediate");
  let running: string | undefined;
  try {
    const applied = database
      .prepare("select name from schema_migrations")
      .all()
      .map((row) => String(row.name));
    const insert = database.prepare("insert into schema_migrations (name, applied_at) values (?, ?)");

    for (const name of planMigrations(available, applied)) {
      running = name;
      database.exec(readFileSync(join(directory, name), "utf8"));
      insert.run(name, new Date().toISOString());
    }
    database.exec("commit");
  } catch (error) {
    // A full disk, an I/O error or a lost lock roll the transaction back by themselves, and then
    // `rollback` throws "no transaction is active" -- which would replace the sentence that says
    // what actually went wrong with one about bookkeeping. The schema is already where it was.
    try {
      database.exec("rollback");
    } catch {
      // Nothing to undo: see above.
    }
    // This one already says what is wrong and what to do about it, and it is not a file that
    // failed: wrapping it would bury the only sentence worth reading.
    if (error instanceof MigrationOrderError) throw error;
    const where = running === undefined ? "the data file" : `migration ${running}`;
    throw new Error(`${where} failed: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}
