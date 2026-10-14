import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// DESIGN.md opens with the token table, and that table is what an agent quotes when it writes a
// colour. It has been found behind `globals.css` three sessions running: on 2026-10-14 it still
// carried Focus Red (`#da6b6b`, light `#ad4b4b`) months after the interactive green replaced it,
// while the prose two hundred lines below already said `#4af262`. A document that is quoted and is
// wrong is worse than one that is silent, so the two are tied together here: either the table is
// the CSS, or this fails and says which token drifted.

const CSS = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");
const DESIGN = readFileSync(fileURLToPath(new URL("../../DESIGN.md", import.meta.url)), "utf8");

function cssTokens(selector: string): Record<string, string> {
  const start = CSS.indexOf(selector);
  if (start < 0) throw new Error(`no ${selector} in globals.css`);
  const block = CSS.slice(CSS.indexOf("{", start) + 1, CSS.indexOf("}", start));
  const found: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) found[name] = value.trim();
  delete found["color-scheme"];
  return found;
}

// The front matter of DESIGN.md, `colors:` up to the next top-level key: the light theme is the same
// names under a `light-` prefix, which is how the document reads them side by side.
function designTokens(): { dark: Record<string, string>; light: Record<string, string> } {
  // The file is checked out with CRLF on Windows, so the anchors cannot carry a bare newline.
  const start = DESIGN.search(/^colors:\s*$/m);
  const end = DESIGN.search(/^typography:\s*$/m);
  if (start < 0 || end < 0) throw new Error("no colors block in DESIGN.md");
  const dark: Record<string, string> = {};
  const light: Record<string, string> = {};
  for (const [, name, value] of DESIGN.slice(start, end).matchAll(/^ {2}([\w-]+): "([^"]+)"/gm)) {
    if (name.startsWith("light-")) light[name.slice("light-".length)] = value;
    else dark[name] = value;
  }
  return { dark, light };
}

// `--link` is `var(--focus)` in the CSS, one ink under two names (DESIGN.md, Interactive Green). The
// table spells the colour out, because a reader of the table has no cascade to resolve it with.
function resolve(value: string, within: Record<string, string>): string {
  const alias = /^var\(--([\w-]+)\)$/.exec(value);
  return alias ? (within[alias[1]] ?? value) : value;
}

// `rgba(255, 123, 107, 0.10)` in the document and `rgba(255, 123, 107, 0.1)` in the CSS are the same
// colour: a trailing zero is not a drift.
const same = (a: string, b: string): boolean =>
  a.toLowerCase().replace(/0+\)$/, ")") === b.toLowerCase().replace(/0+\)$/, ")");

const THEMES = [
  { name: "dark", selector: ":root {" },
  { name: "light", selector: ':root[data-theme="light"] {' },
] as const;

describe.each(THEMES)("$name tokens", ({ name, selector }) => {
  // The light theme redeclares the colours it changes and inherits the rest, `--link` among them:
  // one declaration, `var(--focus)`, that resolves to a different green under each root. The cascade
  // is what a page renders, so it is what the table is held to.
  const css = name === "light" ? { ...cssTokens(":root {"), ...cssTokens(selector) } : cssTokens(selector);
  const documented = designTokens()[name];

  it("says in DESIGN.md what globals.css renders", () => {
    for (const [token, value] of Object.entries(css)) {
      const expected = resolve(value, css);
      const found = documented[token];
      expect(found, `${token} is missing from the DESIGN.md table`).toBeDefined();
      expect(
        same(found, expected),
        `${token}: DESIGN.md says ${found}, globals.css renders ${expected}`,
      ).toBe(true);
    }
  });

  it("declares no colour the CSS does not have", () => {
    for (const token of Object.keys(documented)) {
      expect(css[token], `${token} is in the DESIGN.md table and not in globals.css`).toBeDefined();
    }
  });
});
