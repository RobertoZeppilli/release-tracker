import { describe, expect, it } from "vitest";

import { MigrationOrderError, planMigrations } from "./plan-migrations";

const ONE = "0001_initial_schema.sql";
const TWO = "0002_second.sql";
const THREE = "0003_third.sql";

describe("planMigrations", () => {
  it("applies everything to a database that has never been migrated", () => {
    expect(planMigrations([ONE, TWO], [])).toEqual([ONE, TWO]);
  });

  it("applies nothing to a database already at the latest migration", () => {
    expect(planMigrations([ONE, TWO], [ONE, TWO])).toEqual([]);
  });

  it("applies only what is missing, in order", () => {
    expect(planMigrations([ONE, TWO, THREE], [ONE])).toEqual([TWO, THREE]);
  });

  // The files arrive from a directory listing, which no rule says is sorted, and the order they are
  // applied in is the only thing that makes one migration able to lean on the one before it.
  it("orders the plan by name whatever order the files come in", () => {
    expect(planMigrations([THREE, ONE, TWO], [])).toEqual([ONE, TWO, THREE]);
  });

  // Someone ran a newer build of the app, then went back to this one. Applying what this build knows
  // would write an old schema over a new one, so the honest answer is to stop.
  it("refuses a database holding a migration this build does not have", () => {
    expect(() => planMigrations([ONE, TWO], [ONE, TWO, THREE])).toThrow(MigrationOrderError);
    expect(() => planMigrations([ONE, TWO], [ONE, TWO, THREE])).toThrow(THREE);
  });

  // A migration added with a name that sorts before one already applied: two installs would end up
  // with different schemas, the older one having run it and the newer one skipping it for good.
  it("refuses a migration inserted before one already applied", () => {
    expect(() => planMigrations([ONE, TWO, THREE], [ONE, THREE])).toThrow(MigrationOrderError);
    expect(() => planMigrations([ONE, TWO, THREE], [ONE, THREE])).toThrow(TWO);
  });

  it("names every file it refuses, not just the first", () => {
    expect(() => planMigrations([ONE, TWO, THREE], [THREE])).toThrow(
      /0001_initial_schema\.sql[\s\S]*0002_second\.sql/,
    );
  });
});
