import { expect, type Page, test } from "@playwright/test";

// Issue #133, and DESIGN.md, Back to Top. Three things are worth a test here, and the third is the
// one the issue was written around: the control is **not there** at the top of a page, it **is**
// there below the second screen, and following it takes the keyboard where it takes the page. A
// return that scrolls the reader to the top and leaves the focus in the footer is worse than the
// problem it solves.

const BUTTON = "Back to top";

const button = (page: Page) => page.getByRole("link", { name: BUTTON });

async function pastTwoScreens(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 2 * window.innerHeight + 200));
  await expect(button(page)).toBeVisible();
}

test.describe("back to top, on the landing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("is not in the page at the top, and arrives below the second screen", async ({ page }) => {
    // Not hidden: absent. There is no dead target to tab into and nothing for a screen reader to
    // meet before the page has been scrolled.
    await expect(button(page)).toHaveCount(0);
    await pastTwoScreens(page);
    await expect(button(page)).toHaveCount(1);
  });

  test("takes the scroll and the focus to the top together", async ({ page }) => {
    await pastTwoScreens(page);
    await button(page).click();

    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeLessThan(80);
    // `#content` is the target the skip link already uses, so the two ways into the page agree.
    const focused = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(focused).toBe("content");
    // And it leaves once the reader is back: a control that stays is a control that covers text for
    // no reason.
    await expect(button(page)).toHaveCount(0);
  });

  test("sits in the gutter and does not make the page scroll sideways at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await pastTwoScreens(page);

    const box = await button(page).boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // 44px of target, the whole way round (WCAG 2.2, and the issue's own criterion).
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      // Bottom left on a phone: the corner the last line of the release notes does not end in.
      expect(box.x).toBeLessThan(160);
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
