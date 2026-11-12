import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  anonClient,
  type Catalog,
  clearFollows,
  type Content,
  deleteContent,
  retire,
  seedCatalog,
  seedContent,
  serviceClient,
} from "./supabase";

const PERMISSION_DENIED = "42501";
// The only rule the trigger imposes, as PostgREST forwards it: the ten of the Free Plan left with
// the Plan and with its own `FLIMT` (issue #209, ADR 0011).
const RETIRED = "FRTRD";
// The three rules the trigger of `current_version` imposes.
const MALFORMED = "FVMAL";
const NOT_OLDER = "FVNEW";
const NO_STABLE = "FVNST";

const FollowRowsSchema = z.array(z.object({ technology_id: z.uuid() }));

// ⚠️ **The client of these tests is `anon` and nothing else.** Since issue #210 there is no account
// to sign into, so what the browser holds is the publishable key, and what bounds it is the grant
// the migration leaves behind. The isolation these tests used to prove -- one Developer's rows
// invisible to another's -- is not a weaker rule now, it is a rule about something that no longer
// exists: one installed copy, one person, one table (ADR 0011).
let content: Content;

beforeAll(async () => {
  content = await seedContent();
});

afterAll(async () => {
  await clearFollows();
  await deleteContent(content);
});

async function followed() {
  const { data, error } = await serviceClient().from("follows").select("technology_id");
  if (error) throw error;
  return FollowRowsSchema.parse(data).map((row) => row.technology_id);
}

describe("follows", () => {
  afterEach(clearFollows);

  it("are read, added and let go with the publishable key", async () => {
    const db = anonClient();
    const added = await db.from("follows").insert({ technology_id: content.technologyId });
    expect(added.error).toBeNull();
    expect(await followed()).toEqual([content.technologyId]);

    const read = await db.from("follows").select("technology_id");
    expect(read.error).toBeNull();
    expect(FollowRowsSchema.parse(read.data)).toEqual([{ technology_id: content.technologyId }]);

    const removed = await db.from("follows").delete().eq("technology_id", content.technologyId);
    expect(removed.error).toBeNull();
    expect(await followed()).toEqual([]);
  });

  // The primary key is the Technology now that nobody holds the other half of it: following the
  // same one twice is a duplicate key and not a second row.
  it("hold one row per Technology", async () => {
    const db = anonClient();
    expect((await db.from("follows").insert({ technology_id: content.technologyId })).error).toBeNull();
    const again = await db.from("follows").insert({ technology_id: content.technologyId });
    expect(again.error?.code).toBe("23505");
    expect(await followed()).toEqual([content.technologyId]);
  });
});

// Following several Technologies at once is one statement, not N (issue #126): what the page can
// promise about the group is whatever Postgres does with a trigger that raises halfway through it.
describe("a group of follows in one statement", () => {
  let catalog: Catalog;

  beforeAll(async () => {
    catalog = await seedCatalog(5);
  });

  afterAll(async () => {
    await clearFollows();
    await catalog.remove();
  });

  async function followAll(technologyIds: string[]) {
    return anonClient()
      .from("follows")
      .insert(technologyIds.map((technology_id) => ({ technology_id })));
  }

  it("writes the whole group in one insert", async () => {
    const { error } = await followAll(catalog.technologyIds.slice(0, 3));
    expect(error).toBeNull();
    expect(await followed()).toHaveLength(3);
  });

  // The statement is what Postgres takes back when the trigger raises halfway through it, which is
  // the whole reason the page can say `none followed` instead of counting which ones made it
  // (DESIGN.md, Selection Bar).
  it("refuses a group holding a retired Technology, and follows none of it", async () => {
    const [, , , fourth, fifth] = catalog.technologyIds;
    await retire(fifth);
    const { error } = await followAll([fourth, fifth]);
    expect(error?.code).toBe(RETIRED);
    expect(await followed()).toHaveLength(3);
  });
});

// One level of service, so nothing counts how many Technologies are followed (issue #209, ADR
// 0011). Eleven is the proof, because ten was the wall: the Free Plan refused the eleventh with
// 'FLIMT' until the trigger lost that half of its body.
describe("more than ten follows", () => {
  let catalog: Catalog;

  beforeAll(async () => {
    catalog = await seedCatalog(11);
  });

  afterEach(clearFollows);

  afterAll(async () => {
    await clearFollows();
    await catalog.remove();
  });

  it("are written one at a time, with the eleventh like the first", async () => {
    for (const technology_id of catalog.technologyIds) {
      const { error } = await anonClient().from("follows").insert({ technology_id });
      expect(error).toBeNull();
    }
    expect(await followed()).toHaveLength(11);
  });

  // The group is one statement (issue #126), which is where the limit used to take the whole group
  // down: the eleventh row raised, so the ten before it were taken back too.
  it("are written as one group, in one statement", async () => {
    const { error } = await anonClient()
      .from("follows")
      .insert(catalog.technologyIds.map((technology_id) => ({ technology_id })));
    expect(error).toBeNull();
    expect(await followed()).toHaveLength(11);
  });
});

describe("the follow rules the database imposes", () => {
  let catalog: Catalog;

  beforeAll(async () => {
    catalog = await seedCatalog(3);
  });

  afterAll(async () => {
    await clearFollows();
    await catalog.remove();
  });

  async function follow(technologyId: string) {
    return anonClient().from("follows").insert({ technology_id: technologyId });
  }

  it("refuse a Technology let go after it was retired, which is all a retired follow can do", async () => {
    const [retired] = catalog.technologyIds;
    expect((await follow(retired)).error).toBeNull();

    // It leaves the Catalog while it is followed: the only way a retired follow can exist.
    await retire(retired);
    const { error: removed } = await anonClient().from("follows").delete().eq("technology_id", retired);
    expect(removed).toBeNull();

    expect((await follow(retired)).error?.code).toBe(RETIRED);
  });

  it("refuse a retired Technology that was never followed", async () => {
    const [, second] = catalog.technologyIds;
    await retire(second);
    expect((await follow(second)).error?.code).toBe(RETIRED);
  });
});

// The Version in use is validated by the database, like every other rule about a follow (issue #68):
// well formed, and not newer than the latest stable Release. The day of the declaration is written
// there too, because a client that could set it could make a stale declaration look fresh.
describe("the Version in use", () => {
  let bare: Catalog;

  const DeclarationSchema = z.object({
    current_version: z.string().nullable(),
    current_version_declared_at: z.string().nullable(),
  });

  beforeAll(async () => {
    bare = await seedCatalog(1);
    const { error } = await anonClient().from("follows").insert({ technology_id: content.technologyId });
    if (error) throw error;
  });

  afterAll(async () => {
    await clearFollows();
    await bare.remove();
  });

  async function declare(version: string | null, technologyId = content.technologyId) {
    return anonClient()
      .from("follows")
      .update({ current_version: version })
      .eq("technology_id", technologyId)
      .select("current_version, current_version_declared_at")
      .single();
  }

  function declaration(data: unknown) {
    return DeclarationSchema.parse(data);
  }

  it("starts undeclared", async () => {
    const { data } = await declare(null);
    expect(declaration(data)).toEqual({ current_version: null, current_version_declared_at: null });
  });

  it("is saved with the day the database wrote it, and keeps it when nothing moved", async () => {
    const { data, error } = await declare("1.0.0");
    expect(error).toBeNull();
    const first = declaration(data);
    expect(first.current_version).toBe("1.0.0");
    expect(first.current_version_declared_at).not.toBeNull();

    const again = declaration((await declare("1.0.0")).data);
    expect(again.current_version_declared_at).toBe(first.current_version_declared_at);

    // A different Version is a new declaration, so it stands from now on.
    const moved = declaration((await declare("0.9.0")).data);
    expect(moved.current_version).toBe("0.9.0");
    expect(moved.current_version_declared_at).not.toBe(first.current_version_declared_at);
  });

  it("can be taken away, and takes its day with it", async () => {
    expect((await declare("1.0.0")).error).toBeNull();
    expect(declaration((await declare(null)).data)).toEqual({
      current_version: null,
      current_version_declared_at: null,
    });
  });

  it("refuses a Version newer than the latest stable Release", async () => {
    expect((await declare("2.0.0")).error?.code).toBe(NOT_OLDER);
  });

  it("refuses a Version that is not a Version", async () => {
    expect((await declare("1.x")).error?.code).toBe(MALFORMED);
  });

  it("refuses a Technology with no stable Release to measure from", async () => {
    const [technologyId] = bare.technologyIds;
    const { error: followed } = await anonClient().from("follows").insert({ technology_id: technologyId });
    expect(followed).toBeNull();
    expect((await declare("1.0.0", technologyId)).error?.code).toBe(NO_STABLE);
  });

  // The grant is one column wide, and this is what that buys: an update that could move
  // `technology_id` would walk past the follow rules, which only guard an insert.
  it("is the only column of a follow a client may update", async () => {
    const [technologyId] = bare.technologyIds;
    const { error } = await anonClient()
      .from("follows")
      .update({ technology_id: technologyId })
      .eq("technology_id", content.technologyId);
    expect(error?.code).toBe(PERMISSION_DENIED);
  });
});
