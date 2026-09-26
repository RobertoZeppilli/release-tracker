import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { createDeveloper, deleteDeveloper, type Developer, serviceClient } from "./supabase";

const PlanRowSchema = z.object({ user_id: z.uuid(), plan: z.string() });

let developer: Developer;

beforeAll(async () => {
  developer = await createDeveloper();
});

afterAll(async () => {
  await deleteDeveloper(developer);
});

describe("the Plan of a new Developer", () => {
  it("is free from the first sign in, without the app writing anything", async () => {
    const { data, error } = await developer.client.from("plans").select("user_id, plan").single();
    expect(error).toBeNull();
    expect(PlanRowSchema.parse(data)).toEqual({ user_id: developer.id, plan: "free" });
  });

  it("goes away with the Developer", async () => {
    const gone = await createDeveloper();
    await deleteDeveloper(gone);
    const { data, error } = await serviceClient().from("plans").select("user_id").eq("user_id", gone.id);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
