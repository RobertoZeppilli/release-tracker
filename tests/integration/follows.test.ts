import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  anonClient,
  type Content,
  createDeveloper,
  deleteContent,
  deleteDeveloper,
  type Developer,
  seedContent,
  serviceClient,
} from "./supabase";

const PERMISSION_DENIED = "42501";

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
