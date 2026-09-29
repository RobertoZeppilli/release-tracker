import { expect, test } from "@playwright/test";

// Needs the Catalog synced and imported into the local database (`pnpm catalog:sync`), from real Sources.
test("a Technology page is public and shows its header", async ({ page }) => {
  const response = await page.goto("/technologies/vite");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Vite releases/);
  await expect(page.getByRole("heading", { level: 1, name: "Vite" })).toBeVisible();
  const sources = page.getByRole("list", { name: "Sources" });
  await expect(sources.getByRole("listitem")).toHaveText(["npm vite", "github vitejs/vite"]);
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("a Technology page lists the Releases by major, newest first", async ({ page }) => {
  await page.goto("/technologies/vite");
  await expect(page.getByText(/^latest \d+\.\d+\.\d+$/)).toBeVisible();

  const majors = page.getByRole("heading", { level: 2, name: /^v\d+ \d+ releases?$/ });
  await expect(majors.first()).toBeVisible();
  const numbers = (await majors.allTextContents()).map((text) => Number(/^v(\d+)/.exec(text)?.[1]));
  expect(numbers).toEqual([...numbers].sort((a, b) => b - a));

  // The latest featured Release is always imported, so every page has at least one.
  await expect(page.getByText("featured", { exact: true }).first()).toBeVisible();
});

test("an unknown Technology is a 404", async ({ page }) => {
  const response = await page.goto("/technologies/not-in-the-catalog");
  expect(response?.status()).toBe(404);
});

// The header is a wrapping row, and the facts are one group inside it, as in `technology.html`:
// narrow enough, that group wraps whole and the Follow keeps a line of its own instead of trailing
// the Sources.
test("under 640px the Follow sits below the header facts, not beside the Sources", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/technologies/vite");

  const sources = page.getByRole("list", { name: "Sources" });
  const follow = page.getByRole("link", { name: "Follow Vite" });
  await expect(follow).toBeVisible();

  const facts = await sources.boundingBox();
  const button = await follow.boundingBox();
  expect(facts).not.toBeNull();
  expect(button).not.toBeNull();
  if (!facts || !button) return;
  expect(button.y, "the Follow starts below the Sources").toBeGreaterThanOrEqual(facts.y + facts.height);
  expect(button.x, "the Follow starts at the left edge of the column").toBeLessThan(facts.x + 4);
});
