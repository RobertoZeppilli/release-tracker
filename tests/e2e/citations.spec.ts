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
