import { expect, test } from "@playwright/test";

// Needs the Catalog synced into the local database (`pnpm catalog:sync`).
test("a Technology page is public and shows its header", async ({ page }) => {
  const response = await page.goto("/technologies/vite");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Vite releases/);
  await expect(page.getByRole("heading", { level: 1, name: "Vite" })).toBeVisible();
  const sources = page.getByRole("list", { name: "Sources" });
  await expect(sources.getByRole("listitem")).toHaveText(["npm vite", "github vitejs/vite"]);
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("an unknown Technology is a 404", async ({ page }) => {
  const response = await page.goto("/technologies/not-in-the-catalog");
  expect(response?.status()).toBe(404);
});
