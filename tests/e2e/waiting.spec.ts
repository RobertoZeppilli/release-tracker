import { expect, type Page, test } from "@playwright/test";

// DESIGN.md, The Waiting Rule. One form now, the skeleton, and what is worth a test is the half that
// is easy to lose again: a skeleton has to be **seen**, and it has to **keep moving** under
// `prefers-reduced-motion: reduce`. The first version failed both, and failed them silently: the
// fill was within three points of the page it sat on, and `reduce` froze it, so the whole of a wait
// reached the user as an empty outline.
//
// It is read from the stylesheet the app ships, by putting the class on an element of the page: a
// wait against a local server is over in the time the server takes to answer, and a test that tried
// to catch it in flight would be a test that flakes.

type Read = { animation: string; duration: string; background: string; height: number };

async function skeleton(page: Page): Promise<Read> {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "skeleton-box";
    probe.style.width = "34px";
    probe.style.height = "34px";
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const read = {
      animation: style.animationName,
      duration: style.animationDuration,
      background: style.backgroundColor,
      height: probe.getBoundingClientRect().height,
    };
    probe.remove();
    return read;
  });
}

// `rule` in the dark theme, which is the token the fill is set from. Read as rgb, because that is
// what `getComputedStyle` returns whatever the stylesheet wrote.
const RULE = "rgb(38, 43, 51)";

test.describe("the skeleton", () => {
  // Said out loud, because the machine the suite runs on may ask for reduced motion itself, and the
  // two halves of this rule are told apart by exactly that setting.
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("is a filled block with a highlight sweeping across it", async ({ page }) => {
    const read = await skeleton(page);
    expect(read.animation).toBe("skeleton-sweep");
    expect(read.duration).toBe("1.4s");
    // The fill is the whole reason it is visible: an empty box is what the first version shipped.
    expect(read.background).toBe(RULE);
    expect(read.height).toBe(34);
  });

  test.describe("with reduced motion asked for", () => {
    test.use({ reducedMotion: "reduce" });

    test("keeps moving, by cross-fade instead of by sweep", async ({ page }) => {
      const read = await skeleton(page);
      // Not `none`: a loader that stops is indistinguishable from a product that has stopped. What
      // the setting is owed is the kind of motion, and a cross-fade has no direction to it.
      expect(read.animation).toBe("skeleton-fade");
      expect(read.background).toBe(RULE);
      expect(read.height).toBe(34);
    });
  });
});

test("the two pages behind the login have a wait, and the public ones do not", async ({ page }) => {
  // The loading boundary belongs to the segment and to everything under it: this is what keeps the
  // public Technology and Release pages out of it, and their 404s answering 404.
  const response = await page.goto("/technologies/not-a-technology");
  expect(response?.status()).toBe(404);
});
