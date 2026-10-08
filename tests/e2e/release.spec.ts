import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

const NOTES = "# Fixture 2.0\n\n## Breaking\nThe default export is gone.";

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "1.8.0", significance: "notable", origin: "imported", status: "unavailable", notes: null },
    { version: "1.8.1+build.5", significance: "digest", origin: "imported", status: "skipped", notes: "Fixes a crash." },
    { version: "1.9.0", significance: "notable", origin: "detected", status: "processing", notes: "Adds a flag." },
    { version: "2.0.0", significance: "featured", origin: "detected", status: "pending", notes: NOTES },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

test("a Release page is reached from its Technology page and shows the header", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`);
  await page.getByRole("link", { name: "2.0.0", exact: true }).click();

  await expect(page).toHaveURL(`/technologies/${technology.slug}/2.0.0`);
  await expect(page).toHaveTitle(`${technology.name} 2.0.0 release`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${technology.name} 2.0.0`);
  await expect(page.getByText("2026-01-13", { exact: true })).toBeVisible();
  await expect(page.getByText("featured", { exact: true })).toBeVisible();
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: technology.slug })).toHaveAttribute(
    "href",
    `/technologies/${technology.slug}`,
  );
});

test("pending: the notes are folded, numbered and open from the keyboard", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/2.0.0`);
  const status = page.getByRole("region", { name: "Summary status" });
  await expect(status).toContainText("pending: summary queued");
  await expect(status).toContainText(/Detected \d{4}-\d{2}-\d{2} at \d{2}:\d{2} UTC\./);

  const lines = page.locator("#release-notes li");
  await expect(lines.first()).toBeHidden();
  await page.locator("#release-notes summary").focus();
  await page.keyboard.press("Enter");
  await expect(lines).toHaveText(["# Fixture 2.0", "", "## Breaking", "The default export is gone."]);
  await expect(page.locator("#L4")).toHaveText("The default export is gone.");
  await expect(page.getByText(`github.com/fixture/${technology.slug} · 4 lines`)).toBeVisible();
});

// The provenance row is the one line on the page where a link stands beside a static fact in the same
// faint Mono. It used to be "View on GitHub" with the default underline, indistinguishable at a glance
// from the `detected 2026-10-01 via tag` beside it; now it is a Help Pointer, the way every other link
// in the system declares itself. The `-->` is aria-hidden, so the dashed cyan border is what is read.
test("the link out of the provenance row declares itself as a pointer", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/2.0.0`);
  const pointer = page.getByRole("link", { name: "view on github" });
  await expect(pointer).toBeVisible();

  const label = pointer.locator("span").last();
  const style = await label.evaluate((node) => {
    const computed = getComputedStyle(node);
    return { style: computed.borderBottomStyle, width: computed.borderBottomWidth };
  });
  expect(style.style, "the pointer underline").toBe("dashed");
  expect(style.width, "the pointer underline").not.toBe("0px");
  // The arrow is the other half of the grammar, and it carries no meaning of its own.
  await expect(pointer).toContainText("-->");
  expect(await pointer.locator("[aria-hidden]").count()).toBe(1);
});

test("the Release notes action opens the folded notes", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/2.0.0`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Release notes" }).click();
  await expect(page.locator("#L1")).toBeVisible();
});

test("processing: the Summary is in progress", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.9.0`);
  await expect(page.getByRole("region", { name: "Summary status" })).toContainText(
    "processing: summary in progress",
  );
});

test("unavailable: no notes to open, the Source is linked instead", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.8.0`);
  const status = page.getByRole("region", { name: "Summary status" });
  await expect(status).toContainText("note: no release notes to summarize");
  await expect(status).toContainText("The commit history on GitHub is the best source.");
  await expect(page.locator("#release-notes")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Release notes" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View on GitHub" })).toHaveAttribute(
    "href",
    `https://github.com/${technology.repo}/commits`,
  );
});

test("skipped: a digest Version with build metadata opens from the folded digest row", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}?from=`, { waitUntil: "networkidle" });
  await page.getByText("1 digest release").click();
  await page.getByRole("link", { name: "1.8.1+build.5" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${technology.name} 1.8.1+build.5`);
  const status = page.getByRole("region", { name: "Summary status" });
  await expect(status).toContainText("note: no summary for this digest release");
  await expect(status).not.toContainText(/usually land|queued/);
});

test("an unknown Version is a 404", async ({ page }) => {
  const response = await page.goto(`/technologies/${technology.slug}/9.9.9`);
  expect(response?.status()).toBe(404);
});
