import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

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

// DESIGN.md, Release Row: the plain list declares what each Release means, so the reader does not
// open N Release pages to find out. The local database has no ready Summary, hence the fixture.
test.describe("the Release rows of the plain list", () => {
  let technology: FixtureTechnology;

  test.beforeAll(async () => {
    technology = await seedTechnology([
      { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Safe.", actionRequired: false },
      { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "Breaking.", actionRequired: true },
      { version: "2.0.1", significance: "digest", origin: "detected", status: "skipped", notes: "A fix." },
    ]);
  });

  test.afterAll(async () => {
    await technology.remove();
  });

  // The whole history keeps the orientation a path gives and makes none of its claims: the note says
  // what is on the screen, the bars compare the majors, and the way back is a link, not the browser.
  test("the whole history is counted honestly, read by major, and has a way back", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}`);

    // The link counts the Releases the list prints, so what it promises can be counted on arrival.
    const all = page.getByRole("link", { name: "show all 3 releases" });
    await expect(all).toBeVisible();
    await all.click();
    await expect(page).toHaveURL(/\?from=$/);

    const history = page.getByRole("region", { name: "Recorded history" });
    await expect(history).toContainText("note: the whole recorded history, 3 releases in 2 majors.");
    await expect(history.getByRole("list", { name: "Releases per major version" })).toContainText("2 releases");
    // No verdict here: there is no start, so there is no upgrade to judge.
    await expect(history.getByRole("heading")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /^(warning|ok|note):/ })).toHaveCount(0);

    await history.getByRole("link", { name: "back to the upgrade path" }).click();
    await expect(page).toHaveURL(`/technologies/${technology.slug}`);
    await expect(page.getByRole("region", { name: "Recorded history" })).toHaveCount(0);
  });

  test("declare the verdict, what breaks and where to migrate", async ({ page }) => {
    // An empty `from` is the plain list: without it the page draws the path it derives itself.
    await page.goto(`/technologies/${technology.slug}?from=`);

    const v2 = page.getByRole("region", { name: "v2 2 releases" });
    await expect(v2).toContainText("Fixture 2.0.0 release.");
    await expect(v2).toContainText("warning: action required · 1 breaking change");
    const breaking = v2.getByRole("list", { name: "Breaking changes in 2.0.0" });
    await expect(breaking.getByRole("listitem")).toHaveCount(1);
    await expect(breaking).toContainText("breaking[1]:");
    await expect(breaking).toContainText("The default export is gone");
    await expect(v2.getByRole("link", { name: `migrate to ${technology.slug} 2.0.0` })).toHaveAttribute(
      "href",
      `/technologies/${technology.slug}/2.0.0`,
    );

    // A safe Release says so and lists nothing: there is nothing to migrate.
    const v1 = page.getByRole("region", { name: "v1 1 release" });
    await expect(v1).toContainText("Fixture 1.0.0 release.");
    await expect(v1).toContainText("ok: safe to upgrade");
    await expect(v1.getByRole("list", { name: /^Breaking changes/ })).toHaveCount(0);
    await expect(v1.getByRole("link", { name: /^migrate to/ })).toHaveCount(0);
  });
});
