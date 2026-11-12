import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { type Database, openDatabase } from "./open-database";

let directory: string;
let file: string;
const open = (migrations?: string): Database => openDatabase({ file, migrations });

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "verdict-db-"));
  file = join(directory, "nested", "verdict.db");
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

const tableNames = (database: Database): string[] =>
  database
    .prepare("select name from sqlite_master where type = 'table' order by name")
    .all()
    .map((row) => String(row.name));

const applied = (database: Database): string[] =>
  database
    .prepare("select name from schema_migrations order by name")
    .all()
    .map((row) => String(row.name));

const seedRelease = (database: Database): string => {
  database
    .prepare(
      "insert into technologies (id, slug, name, classification_strategy, category) values (?, ?, ?, ?, ?)",
    )
    .run("t1", "next", "Next.js", "semver", "framework");
  database
    .prepare(
      "insert into releases (id, technology_id, version, significance, origin, published_at) values (?, ?, ?, ?, ?, ?)",
    )
    .run("r1", "t1", "16.3.5", "featured", "detected", "2026-11-01T00:00:00.000Z");
  return "r1";
};

describe("openDatabase", () => {
  it("creates the file, its directory and the whole schema on first start", () => {
    const database = open();
    expect(tableNames(database)).toContain("technologies");
    expect(tableNames(database)).toEqual(expect.arrayContaining(["follows", "releases", "summaries"]));
    expect(applied(database)).toEqual(["0001_initial_schema.sql"]);
    database.close();
  });

  // The acceptance criterion of issue #211: the data file is the reader's, and deleting it is a
  // thing a reader may do.
  it("builds the schema again from nothing when the file is deleted", () => {
    const first = open();
    first.prepare("insert into follows (technology_id) select id from technologies").run();
    first.close();
    rmSync(file);

    const second = open();
    expect(applied(second)).toEqual(["0001_initial_schema.sql"]);
    expect(second.prepare("select count(*) as n from follows").get()).toMatchObject({ n: 0 });
    second.close();
  });

  it("applies nothing on the starts after the first", () => {
    const first = open();
    seedRelease(first);
    first.close();

    const second = open();
    expect(applied(second)).toEqual(["0001_initial_schema.sql"]);
    // The rows of the first start are still there: the migration did not run over them.
    expect(second.prepare("select count(*) as n from releases").get()).toMatchObject({ n: 1 });
    second.close();
  });

  it("enforces the references, which SQLite leaves off unless asked", () => {
    const database = open();
    expect(() =>
      database.prepare("insert into follows (technology_id) values (?)").run("no-such-technology"),
    ).toThrow(/FOREIGN KEY/i);
    database.close();
  });

  it("leaves the schema where it was when a migration fails half way", () => {
    const migrations = join(directory, "migrations");
    mkdirSync(migrations);
    writeFileSync(join(migrations, "0001_fine.sql"), "create table fine (a text);");
    writeFileSync(join(migrations, "0002_broken.sql"), "create table half (a text);\nthis is not sql;");

    expect(() => open(migrations)).toThrow(/0002_broken\.sql/);

    rmSync(join(migrations, "0002_broken.sql"));
    const database = open(migrations);
    expect(tableNames(database)).toContain("fine");
    // The table the broken file created before its error went back with the transaction.
    expect(tableNames(database)).not.toContain("half");
    expect(applied(database)).toEqual(["0001_fine.sql"]);
    database.close();
  });
});

describe("the schema of the first migration", () => {
  it("refuses a value outside a closed set, as the Postgres enum did", () => {
    const database = open();
    expect(() =>
      database
        .prepare("insert into technologies (slug, name, classification_strategy, category) values (?, ?, ?, ?)")
        .run("mystery", "Mystery", "semver", "other"),
    ).toThrow(/constraint/i);
    database.close();
  });

  it("gives a Technology an id and the two timestamps without being told", () => {
    const database = open();
    database
      .prepare("insert into technologies (slug, name, classification_strategy, category) values (?, ?, ?, ?)")
      .run("zod", "Zod", "semver", "library");
    const row = z
      .object({ id: z.string(), created_at: z.string(), retired: z.number() })
      .parse(database.prepare("select id, created_at, retired from technologies").get());
    expect(row.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(row.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(row.retired).toBe(0);
    database.close();
  });

  it("caps the head of the Release Notes one character past what the rule reads", () => {
    const database = open();
    const releaseId = seedRelease(database);
    database.prepare("insert into release_notes (release_id, body) values (?, ?)").run(releaseId, "x".repeat(500));
    const row = z.object({ body_head: z.string() }).parse(database.prepare("select body_head from release_notes").get());
    expect(row.body_head).toHaveLength(401);
    database.close();
  });

  it("refuses a ready Summary that cannot say where it came from", () => {
    const database = open();
    const releaseId = seedRelease(database);
    expect(() =>
      database.prepare("insert into summaries (release_id, status) values (?, 'ready')").run(releaseId),
    ).toThrow(/summaries_ready_provenance|constraint/i);

    database
      .prepare(
        "insert into summaries (release_id, status, content, model, prompt_version) values (?, 'ready', '{}', ?, ?)",
      )
      .run(releaseId, "claude-opus-5", "v3");
    expect(database.prepare("select count(*) as n from summaries").get()).toMatchObject({ n: 1 });
    database.close();
  });

  it("refuses to follow a retired Technology, with the code the interface reads", () => {
    const database = open();
    database
      .prepare(
        "insert into technologies (id, slug, name, classification_strategy, category, retired) values (?, ?, ?, ?, ?, 1)",
      )
      .run("gone", "bower", "Bower", "semver", "build tool");
    expect(() => database.prepare("insert into follows (technology_id) values (?)").run("gone")).toThrow(/FRTRD/);
    database.close();
  });

  it("keeps the Version in use and the day it was declared true or null together", () => {
    const database = open();
    seedRelease(database);
    expect(() =>
      database.prepare("insert into follows (technology_id, current_version) values (?, ?)").run("t1", "16.0.0"),
    ).toThrow(/constraint/i);
    database.close();
  });

  it("writes one Notification per subject however many times the job runs", () => {
    const database = open();
    const releaseId = seedRelease(database);
    const insert = database.prepare(
      "insert into notifications (event, release_id) values ('featured_release', ?) on conflict do nothing",
    );
    insert.run(releaseId);
    insert.run(releaseId);
    expect(database.prepare("select count(*) as n from notifications").get()).toMatchObject({ n: 1 });
    database.close();
  });

  it("refuses a Slack webhook that is not Slack's", () => {
    const database = open();
    expect(() =>
      database
        .prepare("insert into notification_secrets (singleton, slack_webhook_url) values (1, ?)")
        .run("https://example.com/hook"),
    ).toThrow(/constraint/i);
    database.close();
  });

  it("holds one row of settings, whatever is written at it", () => {
    const database = open();
    database.prepare("insert into notification_settings (singleton) values (1)").run();
    expect(() => database.prepare("insert into notification_settings (singleton) values (2)").run()).toThrow(
      /constraint/i,
    );
    database.close();
  });
});
