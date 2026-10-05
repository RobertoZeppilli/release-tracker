import { describe, expect, it } from "vitest";
import { renderQuote } from "./quote-markdown";

// Every line here is a stored line of real Release Notes, taken from the notes the app imports:
// react 19.3.0 (the line the issue measured), vite 8.3.0 and webpack 5.100.0. They are what the
// quote well actually receives, so they are not replaced with invented examples.
const REACT =
  "- Move `react-server-dom-webpack/*.unbundled` to private `react-server-dom-unbundled` (@eps1lon [#35290](https://github.com/facebook/react/pull/35290))";
const VITE =
  "* only treat whole `node_modules` path segments as dependencies (fix [#17467](https://github.com/vitejs/vite/issues/17467)) ([#23437](https://github.com/vitejs/vite/issues/23437))";
const WEBPACK = "- Fixed unexpected error codes from fs.unlink on Windows";
// What the well draws for the react line, once the markdown is gone.
const DRAWN = "Move react-server-dom-webpack/*.unbundled to private react-server-dom-unbundled (@eps1lon #35290)";

// The citation is located in the raw line, which is where the stored quote is found verbatim.
function cite(line: string, quote: string) {
  const start = line.indexOf(quote);
  expect(start, `quote not in the line: ${quote}`).toBeGreaterThanOrEqual(0);
  return renderQuote(line, start, start + quote.length);
}

const plain = (line: string) =>
  renderQuote(line, 0, 0)
    .pieces.map((piece) => piece.text)
    .join("");

describe("renderQuote", () => {
  it("drops the list marker at the head of the line and keeps a dash inside the text", () => {
    expect(plain(WEBPACK)).toBe("Fixed unexpected error codes from fs.unlink on Windows");
    expect(plain("- re-export of a non-existing name is an error")).toBe(
      "re-export of a non-existing name is an error",
    );
    expect(plain("  * nested bullet")).toBe("nested bullet");
  });

  it("renders a backtick span as code and shows no literal backtick", () => {
    const { pieces } = renderQuote(REACT, 0, 0);
    const code = pieces.filter((piece) => piece.code);

    expect(code.map((piece) => piece.text)).toEqual([
      "react-server-dom-webpack/*.unbundled",
      "react-server-dom-unbundled",
    ]);
    expect(plain(REACT)).not.toContain("`");
  });

  it("reduces a markdown link to its label, kept as a link", () => {
    const link = renderQuote(REACT, 0, 0).pieces.find((piece) => piece.href);

    expect(link).toEqual({ text: "#35290", href: "https://github.com/facebook/react/pull/35290", cited: false });
    expect(plain(REACT)).toBe(DRAWN);
  });

  it("keeps an unpaired backtick as written instead of opening a span that never closes", () => {
    const line = "- Deprecate the `unstable_ prefix";

    expect(plain(line)).toBe("Deprecate the `unstable_ prefix");
    expect(renderQuote(line, 0, 0).pieces.some((piece) => piece.code)).toBe(false);
  });

  it("keeps the Inline Code token on a link whose label is itself a code span", () => {
    const line = "- see [`createRoot`](https://react.dev/reference/react-dom/client/createRoot)";

    expect(renderQuote(line, 0, 0).pieces.at(-1)).toEqual({
      text: "createRoot",
      code: true,
      href: "https://react.dev/reference/react-dom/client/createRoot",
      cited: false,
    });
  });

  it("carries several links on one line, each with its own address", () => {
    const links = renderQuote(VITE, 0, 0).pieces.filter((piece) => piece.href);

    expect(links.map((piece) => piece.text)).toEqual(["#17467", "#23437"]);
    expect(links.map((piece) => piece.href)).toEqual([
      "https://github.com/vitejs/vite/issues/17467",
      "https://github.com/vitejs/vite/issues/23437",
    ]);
  });
});

describe("the cited stretch, carried across the cleaning", () => {
  it("underlines the words and not the markdown punctuation around them", () => {
    const { pieces, start, end } = cite(REACT, "`react-server-dom-webpack/*.unbundled` to private");
    const cited = pieces.filter((piece) => piece.cited).map((piece) => piece.text);

    // The quote was stored with its backticks; what gets underlined is what the reader sees.
    expect(cited).toEqual(["react-server-dom-webpack/*.unbundled", " to private"]);
    expect(start).toBe("Move ".length);
    expect(end).toBe("Move react-server-dom-webpack/*.unbundled to private".length);
  });

  it("counts the citation in rendered characters, so the caret row sits under the right words", () => {
    const { start, end, length } = cite(REACT, "to private `react-server-dom-unbundled`");

    expect(end - start).toBe("to private react-server-dom-unbundled".length);
    expect(length).toBe(DRAWN.length);
    // The raw line is longer than what is drawn, which is the whole point of counting this way.
    expect(length).toBeLessThan(REACT.length);
  });

  it("underlines a link label whole when the citation reaches into it", () => {
    const { pieces } = cite(REACT, "(@eps1lon [#35290](https://github.com/facebook/react/pull/35290))");
    const link = pieces.find((piece) => piece.href);

    expect(link?.cited).toBe(true);
    expect(pieces.filter((piece) => piece.cited).map((piece) => piece.text)).toEqual(["(@eps1lon ", "#35290", ")"]);
  });

  it("starts the citation after the list marker the line no longer shows", () => {
    const { start, end } = cite(WEBPACK, "Fixed unexpected error codes");

    expect(start).toBe(0);
    expect(end).toBe("Fixed unexpected error codes".length);
  });

  it("reports an empty stretch when nothing is cited", () => {
    expect(renderQuote(WEBPACK, 0, 0)).toMatchObject({ start: 0, end: 0 });
  });
});
