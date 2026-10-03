import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { listSitemapPages } from "@/modules/releases/server";
import { anonClient, type Content, deleteContent, retire, seedContent } from "./supabase";

let content: Content;
let retired: Content;

beforeAll(async () => {
  content = await seedContent();
  retired = await seedContent();
  await retire(retired.technologyId);
});

afterAll(async () => {
  await deleteContent(content);
  await deleteContent(retired);
});

// The sitemap is rendered with the public client, so `anon` must be able to read everything it
// names. The route itself is prerendered and cannot be asserted on from an E2E against the build.
describe("listSitemapPages", () => {
  it("names the page of a Technology and of each of its Releases", async () => {
    const paths = (await listSitemapPages(anonClient())).map((page) => page.path);
    const slug = await slugOf(content.technologyId);

    expect(paths).toContain(`/technologies/${slug}`);
    expect(paths).toContain(`/technologies/${slug}/1.0.0`);
  });

  it("keeps a retired Technology, whose pages stay reachable", async () => {
    const paths = (await listSitemapPages(anonClient())).map((page) => page.path);
    const slug = await slugOf(retired.technologyId);

    expect(paths).toContain(`/technologies/${slug}`);
    expect(paths).toContain(`/technologies/${slug}/1.0.0`);
  });

  it("dates a Release page by the day its Summary last settled", async () => {
    const slug = await slugOf(content.technologyId);
    const pages = await listSitemapPages(anonClient());
    const release = pages.find((page) => page.path === `/technologies/${slug}/1.0.0`);

    expect(release?.lastModified.getTime()).toBeGreaterThan(0);
  });
});

async function slugOf(technologyId: string): Promise<string> {
  const { data, error } = await anonClient().from("technologies").select("slug").eq("id", technologyId).single();
  if (error) throw error;
  return z.object({ slug: z.string() }).parse(data).slug;
}
