import { describe, expect, it } from "vitest";
import { parseCatalog } from "./parse-catalog";

const vite = {
  name: "Vite",
  description: "Frontend build tool",
  classificationStrategy: "semver",
  sources: [
    { role: "detection", kind: "npm", package: "vite" },
    { role: "notes", kind: "github-releases", repo: "vitejs/vite", tagFormat: "v{version}" },
  ],
};

function file(path: string, content: unknown) {
  return { path, content: JSON.stringify(content) };
}

describe("parseCatalog", () => {
  it("names the file and the field of an invalid entry", () => {
    const broken = { ...vite, sources: [vite.sources[0], { ...vite.sources[1], repo: "vite" }] };
    expect(() => parseCatalog([file("catalog/vite.json", broken)])).toThrow(
      /catalog\/vite\.json: sources\.1\.repo: expected owner\/name/,
    );
  });

  it("takes the slug from the file name", () => {
    expect(parseCatalog([file("catalog/vite.json", vite)])).toEqual([{ slug: "vite", ...vite }]);
  });

  it("rejects a file name that is not a slug", () => {
    expect(() => parseCatalog([file("catalog/Vite.json", vite)])).toThrow(/catalog\/Vite\.json: file name/);
  });

  it("rejects a file that is not JSON", () => {
    expect(() => parseCatalog([{ path: "catalog/vite.json", content: "{" }])).toThrow(
      /catalog\/vite\.json: not valid JSON/,
    );
  });

  // Bun is not published on a registry: the same repository both reports the Versions and holds the
  // notes, which is two Sources, not one.
  it("takes GitHub Releases in both roles for the same repository", () => {
    const bun = {
      ...vite,
      sources: [
        { role: "detection", kind: "github-releases", repo: "oven-sh/bun", tagFormat: "bun-v{version}" },
        { role: "notes", kind: "github-releases", repo: "oven-sh/bun", tagFormat: "bun-v{version}" },
      ],
    };
    expect(parseCatalog([file("catalog/bun.json", bun)])[0].sources).toEqual(bun.sources);
  });

  it("rejects a detection Source whose tag format has no Version in it", () => {
    const broken = {
      ...vite,
      sources: [{ role: "detection", kind: "github-releases", repo: "oven-sh/bun", tagFormat: "bun-v" }],
    };
    expect(() => parseCatalog([file("catalog/bun.json", broken)])).toThrow(/tagFormat: must contain \{version\}/);
  });

  it("rejects two Sources with the same role and kind", () => {
    const twice = { ...vite, sources: [...vite.sources, vite.sources[0]] };
    expect(() => parseCatalog([file("catalog/vite.json", twice)])).toThrow(/sources\.2: duplicate detection\/npm/);
  });

  it("rejects a Technology without a detection Source", () => {
    const notesOnly = { ...vite, sources: [vite.sources[1]] };
    expect(() => parseCatalog([file("catalog/vite.json", notesOnly)])).toThrow(/sources: needs at least one detection/);
  });

  it("rejects an unknown Classification Strategy and unknown fields", () => {
    const wrong = { ...vite, classificationStrategy: "major", priority: 1 };
    expect(() => parseCatalog([file("catalog/vite.json", wrong)])).toThrow(/classificationStrategy: .*\n.*priority/);
  });

  it("accepts a CHANGELOG.md Source and rejects a path outside the repository", () => {
    const changelog = { role: "notes", kind: "changelog", repo: "facebook/react", path: "packages/react/CHANGELOG.md" };
    const react = { ...vite, sources: [vite.sources[0], changelog] };
    expect(parseCatalog([file("catalog/react.json", react)])[0].sources[1]).toEqual(changelog);
    const escaping = { ...react, sources: [vite.sources[0], { ...changelog, path: "../secrets.md" }] };
    expect(() => parseCatalog([file("catalog/react.json", escaping)])).toThrow(/sources\.1\.path: must not leave/);
  });

  it("reports every broken file, not only the first", () => {
    const files = [file("catalog/a.json", {}), file("catalog/b.json", {})];
    expect(() => parseCatalog(files)).toThrow(/catalog\/a\.json[\s\S]*catalog\/b\.json/);
  });
});
