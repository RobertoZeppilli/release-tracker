import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// axe measures the contrast of the text a page actually renders, so it can only see the colours that
// page happens to use. This reads the tokens themselves, in both themes, so a pairing DESIGN.md
// allows is checked even on a state no end-to-end test walks through. Severity glyphs are drawn in
// `currentColor`, so a label that passes carries its glyph with it.

const CSS = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");

type Rgb = [number, number, number];

function tokens(selector: string): Record<string, string> {
  const start = CSS.indexOf(selector);
  if (start < 0) throw new Error(`no ${selector} in globals.css`);
  const block = CSS.slice(CSS.indexOf("{", start) + 1, CSS.indexOf("}", start));
  const found: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) found[name] = value.trim();
  return found;
}

function parse(value: string): { rgb: Rgb; alpha: number } {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: 1 };
  }
  const rgba = /^rgba?\(([^)]+)\)$/.exec(value);
  if (!rgba) throw new Error(`unsupported colour: ${value}`);
  const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.some(Number.isNaN)) throw new Error(`unsupported colour: ${value}`);
  return { rgb: [parts[0], parts[1], parts[2]], alpha: parts[3] ?? 1 };
}

// A wash is translucent: what the eye sees is the wash over whatever plane it sits on.
function over(value: string, backdrop: Rgb): Rgb {
  const { rgb, alpha } = parse(value);
  const mix = (channel: 0 | 1 | 2) => rgb[channel] * alpha + backdrop[channel] * (1 - alpha);
  return [mix(0), mix(1), mix(2)];
}

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// WCAG 2.2: 4.5 for body text, 3 for a large heading and for a non-text control or boundary.
const TEXT = 4.5;
const NON_TEXT = 3;

const THEMES = [
  { name: "dark", selector: ":root {" },
  { name: "light", selector: ':root[data-theme="light"] {' },
] as const;

describe.each(THEMES)("$name theme", ({ selector }) => {
  const token = tokens(selector);
  const plane = (name: string) => parse(token[name]).rgb;
  const ink = (name: string) => parse(token[name]).rgb;

  const PLANES = ["ground", "raised", "sunken"] as const;
  // Every ink that carries words, and so also the severity glyph beside each of those words.
  const INKS = ["text", "text-muted", "text-faint", "breaking", "action", "help", "ok"] as const;

  it.each(PLANES)("reads every ink on %s", (surface) => {
    for (const name of INKS) {
      expect(contrast(ink(name), plane(surface)), `${name} on ${surface}`).toBeGreaterThanOrEqual(TEXT);
    }
  });

  it.each(["breaking-wash", "help-wash"] as const)("reads a cited line washed in %s", (wash) => {
    // Cited lines live in the source view, which is the raised plane.
    const washed = over(token[wash], plane("raised"));
    expect(contrast(ink("text"), washed), `text on ${wash}`).toBeGreaterThanOrEqual(TEXT);
  });

  // A button and a field are identified by their border alone, and the `digest` segment of the stat
  // bar carries a count: all three are `rule-strong`, so it answers to SC 1.4.11 on every plane.
  // The ring is offset 3px, so it is drawn on whatever plane surrounds the control, not only on the
  // page: a panel is `raised` and a hovered row is `sunken`. It answers to SC 1.4.11 on all three.
  it("shows the focus ring and the borders that identify a control", () => {
    for (const surface of PLANES) {
      expect(contrast(ink("focus"), plane(surface)), `focus on ${surface}`).toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(ink("rule-strong"), plane(surface)), `rule-strong on ${surface}`).toBeGreaterThanOrEqual(NON_TEXT);
    }
  });

  it("keeps a selected word legible", () => {
    const selected = over(token["selection"], plane("ground"));
    expect(contrast(ink("text"), selected), "text on selection").toBeGreaterThanOrEqual(TEXT);
  });
});
