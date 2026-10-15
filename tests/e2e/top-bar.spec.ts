import { expect, test } from "@playwright/test";

// DESIGN.md, Layout: "the bar stays on the screen, on every page". It said so for months while the
// bar scrolled away on all of them, in production too, because `top-0` is not a class this project
// has: `--spacing: initial` turns the default scale off, Tailwind 4 builds the inset utilities from
// that scale, and `position: sticky` with `top: auto` sticks to nothing. The user noticed it on
// 2026-10-15. A rule this loud is worth a test that fails when the class quietly stops existing.

const SCROLL = 1200;

for (const path of ["/", "/technologies/react"]) {
  test(`the top bar keeps the top of the screen on ${path}`, async ({ page }) => {
    await page.goto(path);
    const header = page.locator("header");
    await expect(header).toBeVisible();

    const read = await page.evaluate((distance) => {
      window.scrollTo(0, distance);
      const element = document.querySelector("header");
      if (!element) return null;
      return {
        // Where the page actually got to: a page shorter than the scroll asked for is not a failure
        // of the bar, and the assertion below has to know the difference.
        scrolled: window.scrollY,
        top: getComputedStyle(element).top,
        boxTop: element.getBoundingClientRect().top,
      };
    }, SCROLL);

    expect(read).not.toBeNull();
    expect(read?.top).not.toBe("auto");
    expect(read?.boxTop).toBeCloseTo(0, 0);
  });
}
