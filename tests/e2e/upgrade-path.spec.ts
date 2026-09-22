import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "1.0.0", significance: "featured", origin: "imported", status: "skipped", notes: "First." },
    { version: "1.1.0", significance: "notable", origin: "imported", status: "ready", notes: "A flag.", actionRequired: false },
    { version: "1.1.1", significance: "digest", origin: "imported", status: "skipped", notes: "A fix." },
    { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "Breaking.", actionRequired: true },
    { version: "2.0.1", significance: "digest", origin: "detected", status: "skipped", notes: "A fix." },
    { version: "2.1.0", significance: "notable", origin: "detected", status: "pending", notes: "More." },
    { version: "2.2.0-beta.0", significance: "preview", origin: "detected", status: "pending", notes: "Soon." },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

test("entering a Version gives the verdict for the range and leads to its Releases", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`, { waitUntil: "networkidle" });
  await page.getByLabel("Upgrade from").fill("1.0.0");
  await page.getByRole("button", { name: "Check" }).click();

  await expect(page).toHaveURL(`/technologies/${technology.slug}?from=1.0.0`);
  await expect(page.getByRole("heading", { name: "warning: 1 needs action" })).toBeVisible();
  await expect(
    page.getByText(
      "Between 1.0.0 and 2.1.0 there are 5 releases: 1 needs action, 1 is safe to upgrade, 1 has no summary yet (check its notes) and 2 are digest fixes you can skip.",
    ),
  ).toBeVisible();
  const stats = page.getByRole("list", { name: "Releases per major version" }).getByRole("listitem");
  await expect(stats).toHaveText([
    "v1|2 releases · 1 notable · 1 digest",
    "v2|3 releases · 1 featured · 1 notable · 1 digest · 1 needs action · 1 not summarized",
  ]);
  await expect(page.getByRole("heading", { name: "v1 2 releases after 1.0.0" })).toBeVisible();
  await expect(page.getByRole("region", { name: "previews ahead of 2.1.0" })).toContainText("2.2.0-beta.0");

  const v2 = page.getByRole("region", { name: "v2 3 releases" });
  await expect(v2).toContainText("warning: action required");
  await v2.getByRole("link", { name: "2.0.0", exact: true }).click();
  await expect(page).toHaveURL(`/technologies/${technology.slug}/2.0.0`);
});

test("the path survives a reload and says when the start is already the latest", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}?from=2.1.0`);
  await page.reload();
  await expect(page.getByRole("heading", { name: "ok: up to date" })).toBeVisible();
  await expect(page.getByText("2.1.0 is already the latest stable release.")).toBeVisible();
});

test("an invalid Version is reported on the field and the plain list stays", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}?from=2.x`);
  const field = page.getByLabel("Upgrade from");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAccessibleDescription("error: 2.x is not a version. Write it as major.minor.patch, for example 2.1.0.");
  await expect(page.getByRole("region", { name: "v2 3 releases" })).toBeVisible();
});

test("a Version that is not recorded still gets a path, with the recorded ones around it", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}?from=1.5.0`);
  const field = page.getByLabel("Upgrade from");
  await expect(field).toHaveAccessibleDescription(/1\.5\.0 is not a recorded .* release/);
  await expect(page.getByRole("link", { name: "1.1.1" })).toHaveAttribute("href", `/technologies/${technology.slug}?from=1.1.1`);
  await expect(page.getByRole("heading", { name: "warning: 1 needs action" })).toBeVisible();
});
