import { expect, test } from "@playwright/test";
import { clearNotificationSettings, e2eAuthSecret, type FixtureDeveloper, seedDeveloper } from "./fixtures";

// The dialog "Add to Slack" opens before leaving for Slack (#199), and the layout of production
// around it: no field to paste a webhook into (#194).
//
// ⚠️ **This file skips itself when the Slack app's credentials are unset**, which is the CI and the
// normal development run: without them the button is not drawn at all, by decision (#188), and there
// is nothing to open. It runs when they are set, which is how this was proved on 2026-10-28:
//
//     SLACK_CLIENT_ID=0000000000.1111111111 SLACK_CLIENT_SECRET=finto pnpm dev
//     pnpm test:e2e slack-dialog
//
// The credentials can be fake, because nothing here follows the link to Slack: what would happen on
// slack.com is Slack's half of the round, proved by hand in production. A skipped test says so out
// loud, which is the point: it is not a hole hidden behind a pass.

let developer: FixtureDeveloper;

test.beforeAll(async () => {
  developer = await seedDeveloper();
});

test.afterAll(async () => {
  await clearNotificationSettings(developer.id);
  await developer.remove();
});

test("the dialog says what Slack will ask, and the trial it does not start", async ({ page }) => {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
  await page.goto("/settings");

  const button = page.getByRole("link", { name: "Add to Slack" });
  test.skip((await button.count()) === 0, "the Slack app's credentials are unset, so there is no button");

  // With the credentials in the environment the field to paste a webhook into is gone: this is the
  // layout production has, and the only run in which it is seen at all.
  await expect(page.getByLabel("incoming webhook URL")).toHaveCount(0);

  await button.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Add Verdict to Slack")).toBeVisible();
  await expect(dialog.getByText("which workspace Verdict is added to")).toBeVisible();
  await expect(dialog.getByText("which channel the messages land in")).toBeVisible();
  // The sentence that matters: the trial does not start here, and the dialog has to say so.
  await expect(dialog.getByText("The 30 day trial of Slack starts the first time")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "continue to Slack" })).toHaveAttribute(
    "href",
    "/slack/install?locale=en",
  );

  // `Esc` closes it, which is Radix's own doing and is asserted because it is a promise of WCAG 2.2.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Cancel does nothing but close: the address is still `/settings` and Slack was never reached.
  await button.click();
  await page.getByRole("button", { name: "cancel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL("/settings");
});
