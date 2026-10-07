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

test("the path is there before anyone asks, starting from the last release of the previous major", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`, { waitUntil: "networkidle" });

  await expect(page.getByLabel("Upgrade from")).toHaveValue("1.1.1");
  await expect(page.getByLabel("Upgrade from")).toHaveAccessibleDescription(
    "note: starting from 1.1.1, the last release of the previous major, because no version was given.",
  );
  // The path covers the whole v2 line, 2.0.0 included: that is the point of starting a major back.
  await expect(page.getByRole("heading", { name: "warning: 1 needs action" })).toBeVisible();
  await expect(page.getByRole("region", { name: "v2 3 releases" })).toBeVisible();
  await expect(page.getByRole("region", { name: /^v1/ })).toHaveCount(0);

  // One group, so there is nothing to compare: a bar alone would be 100% of itself and say it of
  // every path. The words stay and the lane goes, which is why no `|` is left in the row, and the
  // legend goes with the bars it explains.
  await expect(page.getByRole("list", { name: "Releases per major version" }).getByRole("listitem")).toHaveText([
    "v23 releases · 1 featured · 1 notable · 1 digest, 1 needs action, 1 not summarized",
  ]);
  await expect(page.getByRole("list", { name: "Bar fills" })).toHaveCount(0);

  // And the whole recorded history is one pointer away.
  await page.getByRole("link", { name: "show all 7 releases" }).click();
  await expect(page).toHaveURL(`/technologies/${technology.slug}?from=`);
  await expect(page.getByLabel("Upgrade from")).toHaveValue("");
  await expect(page.getByRole("region", { name: "v1 3 releases" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /needs action|up to date/ })).toHaveCount(0);
});

// Issue #113: the two controls and the facts they work on are one panel, and no fact of it is left
// inside a sentence. A Visitor gets the path half of it and nothing else: declaring a Version in use
// exists only behind the login, so the `in use` row is not there to be found.
test("the panel carries the path and its facts, and the declaration only behind the login", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`, { waitUntil: "networkidle" });

  const panel = page.getByRole("region", { name: "upgrade path" });
  await expect(panel.getByLabel("Upgrade from")).toBeVisible();
  // The destination is a row of the panel, not the `to 2.1.0` that used to sit inside the control.
  await expect(panel).toHaveText(/latest\s*2\.1\.0/);
  await expect(panel.getByLabel("Version in use")).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Save" })).toHaveCount(0);
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
  // The cross-cutting counts come after a comma, the partition after a dot: 1 + 1 + 1 is the 3 the
  // row opens with, and the two numbers that count the same Releases again stay outside that sum
  // (DESIGN.md, Stat Row). The `|` is the bar's own lane, and two majors is what earns it.
  const stats = page.getByRole("list", { name: "Releases per major version" }).getByRole("listitem");
  await expect(stats).toHaveText([
    "v1|2 releases · 1 notable · 1 digest",
    "v2|3 releases · 1 featured · 1 notable · 1 digest, 1 needs action, 1 not summarized",
  ]);
  // The legend is read out, not only seen, so it is a list with a name: it lists the levels the bars
  // actually carry, and `needs action` last, because the amber lane cuts across them instead of
  // dividing the bar.
  await expect(page.getByRole("list", { name: "Bar fills" }).getByRole("listitem")).toHaveText([
    "featured",
    "notable",
    "digest",
    "needs action",
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
