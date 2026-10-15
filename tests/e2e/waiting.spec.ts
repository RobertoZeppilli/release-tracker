import { expect, type Page, test } from "@playwright/test";

// DESIGN.md, The Waiting Rule. What is worth a test here is the half that is easy to lose: a wait
// moves, and under `prefers-reduced-motion: reduce` it **stops moving without disappearing**. A
// reader who asked for no motion is still owed the answer that something is on its way.
//
// Both forms are read from the stylesheet the app ships, by putting the class on an element of the
// page: a wait against a local server is over in the time the server takes to answer, and a test
// that tried to catch it in flight would be a test that flakes.

type Read = { animation: string; duration: string; opacity: string; height: number };

async function form(page: Page, className: string): Promise<Read> {
  return page.evaluate((cls) => {
    const probe = document.createElement("div");
    probe.className = cls;
    probe.style.width = "34px";
    probe.style.height = "34px";
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const read = {
      animation: style.animationName,
      duration: style.animationDuration,
      opacity: style.opacity,
      height: probe.getBoundingClientRect().height,
    };
    probe.remove();
    return read;
  }, className);
}

test.describe("the two forms of a wait", () => {
  // Said out loud, because the machine the suite runs on may ask for reduced motion itself, and the
  // two halves of this rule are told apart by exactly that setting.
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("the bar runs between one page and the next", async ({ page }) => {
    const read = await form(page, "progress-zigzag");
    expect(read.animation).toBe("progress-zigzag");
    expect(read.duration).toBe("2s");
  });

  test("the skeleton breathes inside a control", async ({ page }) => {
    const read = await form(page, "skeleton-box");
    expect(read.animation).toBe("skeleton-breath");
    expect(read.duration).toBe("1.6s");
  });

  test.describe("with reduced motion asked for", () => {
    test.use({ reducedMotion: "reduce" });

    test("both stop moving, and both stay there", async ({ page }) => {
      for (const cls of ["progress-zigzag", "skeleton-box"]) {
        const read = await form(page, cls);
        expect(read.animation).toBe("none");
        // Visible, not hidden: the animation is what made it breathe, and with the animation gone it
        // is simply drawn.
        expect(Number(read.opacity)).toBeGreaterThan(0.3);
        // Drawn at the size it was given, which is what "stays there" means.
        expect(read.height).toBeGreaterThan(0);
      }
    });
  });
});
