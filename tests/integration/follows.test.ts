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
// The two rules the trigger of `follow_limits` imposes, as PostgREST forwards them.
const LIMIT_REACHED = "FLIMT";
const RETIRED = "FRTRD";
const FREE_LIMIT = 10;

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

describe("plans", () => {
  it("start on Free and are visible only to their Developer", async () => {
    const own = await alice.client.from("plans").select("user_id, plan");
    expect(own.data).toEqual([{ user_id: alice.id, plan: "free" }]);

    const other = await bob.client.from("plans").select("user_id").eq("user_id", alice.id);
    expect(other.data).toEqual([]);
  });
});

describe("the follow rules the database imposes", () => {
  let catalog: Catalog;
  let carol: Developer;

  beforeAll(async () => {
    [catalog, carol] = await Promise.all([seedCatalog(FREE_LIMIT + 1), createDeveloper()]);
  });

  afterAll(async () => {
    await deleteDeveloper(carol);
    await catalog.remove();
  });

  async function follow(technologyId: string) {
    return carol.client.from("follows").insert({ user_id: carol.id, technology_id: technologyId });
  }

  it("refuse the eleventh Technology, and count a retired one among the ten", async () => {
    const [retired, ...rest] = catalog.technologyIds;
    for (const technologyId of catalog.technologyIds.slice(0, FREE_LIMIT)) {
      const { error } = await follow(technologyId);
      expect(error).toBeNull();
    }

    // It leaves the Catalog while it is followed: the only way a retired follow can exist.
    await retire(retired);
    const eleventh = rest[FREE_LIMIT - 1];
    expect((await follow(eleventh)).error?.code).toBe(LIMIT_REACHED);

    // Room again once the retired one is let go, which is all a retired follow can do.
    const { error: removed } = await carol.client.from("follows").delete().eq("technology_id", retired);
    expect(removed).toBeNull();
    expect((await follow(eleventh)).error).toBeNull();

    // And it cannot come back, even below the limit.
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
