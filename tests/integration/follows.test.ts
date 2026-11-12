import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  anonClient,
  type Catalog,
  type Content,
  createDeveloper,
  deleteContent,
  deleteDeveloper,
  type Developer,
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

const FollowRowsSchema = z.array(z.object({ user_id: z.uuid() }));

let content: Content;
let alice: Developer;
let bob: Developer;

beforeAll(async () => {
  content = await seedContent();
  [alice, bob] = await Promise.all([createDeveloper(), createDeveloper()]);
  const { error } = await alice.client
    .from("follows")
    .insert({ user_id: alice.id, technology_id: content.technologyId });
  if (error) throw error;
});

afterAll(async () => {
  await Promise.all([deleteDeveloper(alice), deleteDeveloper(bob)]);
  await deleteContent(content);
});

async function followersOf(technologyId: string) {
  const { data, error } = await serviceClient()
    .from("follows")
    .select("user_id")
    .eq("technology_id", technologyId);
  if (error) throw error;
  return FollowRowsSchema.parse(data).map((row) => row.user_id);
}

describe("follows", () => {
  it("are visible only to their Developer", async () => {
    const own = await alice.client.from("follows").select("user_id");
    expect(FollowRowsSchema.parse(own.data)).toEqual([{ user_id: alice.id }]);

    const other = await bob.client.from("follows").select("user_id");
    expect(other.data).toEqual([]);
  });

  it("cannot be read by anon", async () => {
    const { error } = await anonClient().from("follows").select("user_id");
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  it("cannot be added for another Developer", async () => {
    const { error } = await bob.client
      .from("follows")
      .insert({ user_id: alice.id, technology_id: content.technologyId });
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  it("cannot be removed by another Developer", async () => {
    await bob.client.from("follows").delete().eq("user_id", alice.id);
    expect(await followersOf(content.technologyId)).toEqual([alice.id]);
  });

  it("can be added and removed by their Developer", async () => {
    const added = await bob.client
      .from("follows")
      .insert({ user_id: bob.id, technology_id: content.technologyId });
    expect(added.error).toBeNull();
    expect(await followersOf(content.technologyId)).toContain(bob.id);

    const removed = await bob.client.from("follows").delete().eq("user_id", bob.id);
    expect(removed.error).toBeNull();
    expect(await followersOf(content.technologyId)).toEqual([alice.id]);
  });
});

// Following several Technologies at once is one statement, not N (issue #126): what the page can
// promise about the group is whatever Postgres does with a trigger that raises halfway through it.
describe("a group of follows in one statement", () => {
  let catalog: Catalog;
  let erin: Developer;

  beforeAll(async () => {
    [catalog, erin] = await Promise.all([seedCatalog(5), createDeveloper()]);
  });

  afterAll(async () => {
    await deleteDeveloper(erin);
    await catalog.remove();
  });

  async function followAll(technologyIds: string[]) {
    return erin.client
      .from("follows")
      .insert(technologyIds.map((technology_id) => ({ user_id: erin.id, technology_id })));
  }

  async function followedByErin() {
    const { data, error } = await serviceClient()
      .from("follows")
      .select("user_id")
      .eq("user_id", erin.id);
    if (error) throw error;
    return FollowRowsSchema.parse(data).length;
  }

  it("writes the whole group in one insert", async () => {
    const { error } = await followAll(catalog.technologyIds.slice(0, 3));
    expect(error).toBeNull();
    expect(await followedByErin()).toBe(3);
  });

  // The statement is what Postgres takes back when the trigger raises halfway through it, which is
  // the whole reason the page can say `none followed` instead of counting which ones made it
  // (DESIGN.md, Selection Bar).
  it("refuses a group holding a retired Technology, and follows none of it", async () => {
    const [, , , fourth, fifth] = catalog.technologyIds;
    await retire(fifth);
    const { error } = await followAll([fourth, fifth]);
    expect(error?.code).toBe(RETIRED);
    expect(await followedByErin()).toBe(3);
  });
});

// There is one level of service, so there is no number of Technologies a Developer may not pass
// (issue #209, ADR 0011). Eleven is the proof, because ten was the wall: the Free Plan refused the
// eleventh with 'FLIMT' until the trigger lost that half of its body.
describe("more than ten follows", () => {
  let catalog: Catalog;
  let frank: Developer;
  let grace: Developer;

  beforeAll(async () => {
    [catalog, frank, grace] = await Promise.all([
      seedCatalog(11),
      createDeveloper(),
      createDeveloper(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([deleteDeveloper(frank), deleteDeveloper(grace)]);
    await catalog.remove();
  });

  async function countFollowedBy(userId: string) {
    const { data, error } = await serviceClient()
      .from("follows")
      .select("user_id")
      .eq("user_id", userId);
    if (error) throw error;
    return FollowRowsSchema.parse(data).length;
  }

  it("are written one at a time, with the eleventh like the first", async () => {
    for (const technology_id of catalog.technologyIds) {
      const { error } = await frank.client
        .from("follows")
        .insert({ user_id: frank.id, technology_id });
      expect(error).toBeNull();
    }
    expect(await countFollowedBy(frank.id)).toBe(11);
  });

  // The group is one statement (issue #126), which is where the limit used to take the whole group
  // down: the eleventh row raised, so the ten before it were taken back too.
  it("are written as one group, in one statement", async () => {
    const { error } = await grace.client
      .from("follows")
      .insert(
        catalog.technologyIds.map((technology_id) => ({ user_id: grace.id, technology_id })),
      );
    expect(error).toBeNull();
    expect(await countFollowedBy(grace.id)).toBe(11);
  });
});

describe("the follow rules the database imposes", () => {
  let catalog: Catalog;
  let carol: Developer;

  beforeAll(async () => {
    [catalog, carol] = await Promise.all([seedCatalog(3), createDeveloper()]);
  });

  afterAll(async () => {
    await deleteDeveloper(carol);
    await catalog.remove();
  });

  async function follow(technologyId: string) {
    return carol.client.from("follows").insert({ user_id: carol.id, technology_id: technologyId });
  }

  it("refuse a Technology let go after it was retired, which is all a retired follow can do", async () => {
    const [retired] = catalog.technologyIds;
    expect((await follow(retired)).error).toBeNull();

    // It leaves the Catalog while it is followed: the only way a retired follow can exist.
    await retire(retired);
    const { error: removed } = await carol.client.from("follows").delete().eq("technology_id", retired);
    expect(removed).toBeNull();

    expect((await follow(retired)).error?.code).toBe(RETIRED);
  });

  it("refuse a retired Technology to a Developer who follows nothing", async () => {
    const [retired] = catalog.technologyIds;
    await retire(retired);
    const dave = await createDeveloper();
    const { error } = await dave.client
      .from("follows")
      .insert({ user_id: dave.id, technology_id: retired });
    expect(error?.code).toBe(RETIRED);
    await deleteDeveloper(dave);
  });
});

// The Version in use is validated by the database, like every other rule about a follow (issue #68):
// well formed, and not newer than the latest stable Release. The day of the declaration is written
// there too, because a client that could set it could make a stale declaration look fresh.
describe("the Version in use", () => {
  let erin: Developer;
  let bare: Catalog;

  const DeclarationSchema = z.object({
    current_version: z.string().nullable(),
    current_version_declared_at: z.string().nullable(),
  });

  beforeAll(async () => {
    [erin, bare] = await Promise.all([createDeveloper(), seedCatalog(1)]);
    const { error } = await erin.client
      .from("follows")
      .insert({ user_id: erin.id, technology_id: content.technologyId });
    if (error) throw error;
  });

  afterAll(async () => {
    await deleteDeveloper(erin);
    await bare.remove();
  });

  async function declare(version: string | null, technologyId = content.technologyId) {
    return erin.client
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
    const { error: followed } = await erin.client
      .from("follows")
      .insert({ user_id: erin.id, technology_id: technologyId });
    expect(followed).toBeNull();
    expect((await declare("1.0.0", technologyId)).error?.code).toBe(NO_STABLE);
  });

  it("cannot be written on another Developer's follow", async () => {
    expect((await declare("1.0.0")).error).toBeNull();
    await bob.client.from("follows").update({ current_version: "0.1.0" }).eq("user_id", erin.id);

    const { data } = await declare("1.0.0");
    expect(declaration(data).current_version).toBe("1.0.0");
  });

  it("is the only column of a follow a Developer may update", async () => {
    const [technologyId] = bare.technologyIds;
    const { error } = await erin.client
      .from("follows")
      .update({ technology_id: technologyId })
      .eq("technology_id", content.technologyId);
    expect(error?.code).toBe(PERMISSION_DENIED);
  });
});
