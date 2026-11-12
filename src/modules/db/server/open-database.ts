import "server-only";

import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { databaseFile } from "../domain/database-file";
import { planMigrations } from "../domain/plan-migrations";

export type Database = DatabaseSync;

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
  const applied = database
    .prepare("select name from schema_migrations")
    .all()
    .map((row) => String(row.name));

  for (const name of planMigrations(available, applied)) {
    const statements = readFileSync(join(directory, name), "utf8");
    // One transaction per migration, so a file that fails half way leaves the schema where it was
    // and the next start tries the same file again instead of a database nobody can name a version
    // for. ⚠️ `exec` cannot run inside a prepared statement, hence the explicit begin/commit.
    database.exec("begin");
    try {
      database.exec(statements);
      database
        .prepare("insert into schema_migrations (name, applied_at) values (?, ?)")
        .run(name, new Date().toISOString());
      database.exec("commit");
    } catch (error) {
      database.exec("rollback");
      throw new Error(`migration ${name} failed: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }
}
