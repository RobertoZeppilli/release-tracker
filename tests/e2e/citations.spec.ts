import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

// Line 1 is the heading, line 2 blank, so the quotes below land on lines 3 and 4.
const NOTES = ["# Release 3.0.0", "", "The default export is gone; use the named export instead.", "Node 20 or later is required."].join("\n");

const SUMMARY = {
  title: "The default export is gone.",
  keyPoints: [
    { text: "Node 20 or later.", quote: "Node 20 or later is required." },
    { text: "Named exports only." },
    // A quote the notes do not contain: invented, so it gets no pointer.
    { text: "Smaller bundle.", quote: "The bundle is 30% smaller" },
  ],
  breakingChanges: [{ change: "The default export is gone", migration: "Import `{ create }` instead.", quote: "The default export is gone" }],
  actionRequired: true,
};

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "3.0.0", significance: "featured", origin: "detected", status: "ready", notes: NOTES, summary: SUMMARY },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

test("a cite pointer opens the notes, scrolls to the cited line and takes the focus", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/3.0.0`);

  const notes = page.locator("#release-notes");
  await expect(notes).not.toHaveAttribute("open", /.*/);

  await page.getByRole("link", { name: "release-notes:3" }).click();

  await expect(notes).toHaveAttribute("open", /.*/);
  await expect(page.locator("#L3")).toBeVisible();
  await expect(page.locator("#L3")).toBeFocused();
  await expect(page.locator("#L3 .cited-span")).toHaveText("The default export is gone");
  await expect(page).toHaveURL(/#L3$/);
});

test("the pointer works from the keyboard", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/3.0.0`);

  const pointer = page.getByRole("link", { name: "release-notes:4" });
  await pointer.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("#release-notes")).toHaveAttribute("open", /.*/);
  await expect(page.locator("#L4")).toBeFocused();
});

// "Nessuna invenzione": a quote that is not in the notes is not pointed at.
test("a key point whose quote is not in the notes has no pointer", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/3.0.0`);

  const points = page.getByRole("list", { name: "Key points" }).getByRole("listitem");
  await expect(points.nth(0).getByRole("link")).toHaveCount(1);
  await expect(points.nth(1).getByRole("link")).toHaveCount(0);
  await expect(points.nth(2).getByRole("link")).toHaveCount(0);
});

test("an #L anchor opens the notes on that line", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/3.0.0#L4`);

  await expect(page.locator("#release-notes")).toHaveAttribute("open", /.*/);
  await expect(page.locator("#L4")).toBeFocused();
});

// Issue #84: the notes are markdown, and the quote well renders them cleaned while the panel below
// keeps the line character for character. The line is a real one, from react 19.3.0.
const RAW = "- Move `react-server-dom-webpack/*.unbundled` to private `react-server-dom-unbundled` (@eps1lon [#35290](https://github.com/facebook/react/pull/35290))";
const MARKDOWN_NOTES = ["# Release 4.0.0", "", RAW].join("\n");
const QUOTE = "Move `react-server-dom-webpack/*.unbundled` to private `react-server-dom-unbundled`";

test.describe("a quote taken from markdown notes", () => {
  let markdown: FixtureTechnology;

  test.beforeAll(async () => {
    markdown = await seedTechnology([
      {
        version: "4.0.0",
        significance: "featured",
        origin: "detected",
        status: "ready",
        notes: MARKDOWN_NOTES,
        summary: {
          title: "The unbundled entry point is private.",
          keyPoints: [{ text: "One entry point moved." }, { text: "The bundled entry is unchanged." }, { text: "No other export moved." }],
          breakingChanges: [{ change: "The unbundled entry point is private", migration: "Import the bundled entry instead.", quote: QUOTE }],
          actionRequired: true,
        },
      },
    ]);
  });

  test.afterAll(async () => {
    await markdown.remove();
  });

  test("reads as prose in the well and stays verbatim in the notes", async ({ page }) => {
    await page.goto(`/technologies/${markdown.slug}/4.0.0`);

    const diagnostic = page.locator('article[aria-labelledby="b1"]');
    const quote = await diagnostic.innerText();

    expect(quote).toContain("Move react-server-dom-webpack/*.unbundled to private react-server-dom-unbundled");
    // No list dash of its own, no literal backtick, and the address of the link is not spelled out.
    expect(quote).not.toContain("`");
    expect(quote).not.toContain("https://github.com");
    expect(quote).not.toContain("[#35290]");
    await expect(diagnostic.getByRole("link", { name: "#35290" })).toHaveAttribute(
      "href",
      "https://github.com/facebook/react/pull/35290",
    );

    // The panel below is where the comparison with the original is made: it changes in nothing.
    await page.getByRole("link", { name: "release-notes:3" }).click();
    await expect(page.locator("#L3")).toHaveText(RAW);
  });
});

// Issue #85: the forward leg left the reader inside the notes with no way back to the diagnostic.
test.describe("the way back from a citation", () => {
  test("returns to the breaking change that cited, from the keyboard alone", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}/3.0.0`);

    const pointer = page.getByRole("link", { name: "release-notes:3" });
    await pointer.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#L3")).toBeFocused();

    // The pointer sits on the row above the cited line, so it is the tab stop before it: Shift+Tab,
    // the key that already means "back", is what reaches it.
    await page.keyboard.press("Shift+Tab");
    const back = page.getByRole("link", { name: "back to breaking[1]" });
    await expect(back).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.locator("#b1")).toBeFocused();
    await expect(page.locator("#b1")).toBeVisible();
    await expect(page.locator("#b1")).toContainText("breaking[1]: The default export is gone");
  });

  test("a key point's citation returns to that key point, not to the breaking change", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}/3.0.0`);

    await page.getByRole("link", { name: "release-notes:4" }).click();
    await expect(page.getByRole("link", { name: "back to breaking[1]" })).toHaveCount(0);

    await page.getByRole("link", { name: "back to note[1]" }).click();
    await expect(page.locator("#n1")).toBeFocused();
    await expect(page.locator("#n1")).toContainText("note[1]: Node 20 or later.");
  });

  // One citation is active at a time, so there is one pointer: it moves to whatever was cited last.
  test("only the active range carries a pointer", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}/3.0.0`);

    await page.getByRole("link", { name: "release-notes:3" }).click();
    await expect(page.getByRole("link", { name: /^back to/ })).toHaveCount(1);

    await page.getByRole("link", { name: "release-notes:4" }).click();
    const back = page.getByRole("link", { name: /^back to/ });
    await expect(back).toHaveCount(1);
    await expect(back).toHaveText("back to note[1]");
  });
});
