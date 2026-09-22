import { expect, test } from "@playwright/test";

test("home renders in dark mode by default", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/release-tracker/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("main")).toBeVisible();
});
