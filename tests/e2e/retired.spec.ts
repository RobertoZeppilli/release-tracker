import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology(
    [
      { version: "2.0.0", significance: "featured", origin: "imported", status: "pending", notes: "### Breaking" },
      { version: "2.1.0", significance: "notable", origin: "detected", status: "pending", notes: "### Features" },
      { version: "3.0.0-beta.1", significance: "preview", origin: "detected", status: "pending", notes: "### Beta" },
    ],
    { retired: true },
  );
});

test.afterAll(async () => {
  await technology.remove();
});

test("a retired Technology stays online with the retirement note and no upcoming Previews", async ({ page }) => {
  const response = await page.goto(`/technologies/${technology.slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("note")).toHaveText(
    `note: ${technology.name} is no longer tracked. Releases up to 2.1.0 stay readable, but new versions are not detected.`,
  );
  await expect(page.getByRole("link", { name: /2\.1\.0/ }).first()).toBeVisible();
  await expect(page.getByText("3.0.0-beta.1")).toHaveCount(0);
});

test("a retired Technology's Release page stays online with the retirement note", async ({ page }) => {
  const response = await page.goto(`/technologies/${technology.slug}/2.0.0`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("note")).toHaveText(
    `note: ${technology.name} is no longer tracked. Its releases stay readable, but new versions are not detected.`,
  );
});
