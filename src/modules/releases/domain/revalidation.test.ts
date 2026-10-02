import { describe, expect, it } from "vitest";
import { publicPagesFor } from "./revalidation";

describe("publicPagesFor", () => {
  it("pairs each Release with its Technology page", () => {
    expect(publicPagesFor([{ slug: "react", version: "19.0.0" }])).toEqual([
      "/technologies/react",
      "/technologies/react/19.0.0",
      "/sitemap.xml",
    ]);
  });

  it("names the Technology page once for several Versions", () => {
    const paths = publicPagesFor([
      { slug: "react", version: "19.0.0" },
      { slug: "react", version: "19.1.0" },
    ]);

    expect(paths).toEqual([
      "/technologies/react",
      "/technologies/react/19.0.0",
      "/technologies/react/19.1.0",
      "/sitemap.xml",
    ]);
  });

  it("encodes a Version the way the page is addressed", () => {
    expect(publicPagesFor([{ slug: "node", version: "1.0.0+build.5" }])).toContain("/technologies/node/1.0.0%2Bbuild.5");
  });

  it("marks the sitemap stale, which lists the same pages", () => {
    expect(publicPagesFor([{ slug: "react", version: "19.0.0" }])).toContain("/sitemap.xml");
  });

  it("has nothing to revalidate without Releases", () => {
    expect(publicPagesFor([])).toEqual([]);
  });
});
