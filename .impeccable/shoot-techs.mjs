import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const base = "file:///C:/Users/rober/progetti/release-tracker/design/mocks/technologies.html";
const dir = ".impeccable/review/technologies";
const browser = await chromium.launch();
const shots = [
  // [w, h, state, theme, file, fullPage, action]
  [1440, 900, "seven", null, "desktop.png", true],
  [1440, 900, "seven", null, "desktop-fold.png", false],
  [390, 844, "seven", null, "mobile.png", true],
  [1440, 900, "seven", "light", "desktop-light.png", false],
  [1440, 900, "full", null, "state-full.png", false, "scroll-catalog"],
  [390, 844, "full", null, "mobile-full.png", false, "scroll-catalog"],
  [1440, 900, "rejected", null, "state-rejected.png", false, "scroll-rejected"],
  [390, 844, "rejected", null, "mobile-rejected.png", false, "scroll-rejected"],
  [1440, 900, "retired", null, "state-retired.png", false, "scroll-retired"],
  [1440, 900, "retired", null, "state-retired-unfollowed.png", false, "unfollow-retired"],
  [1440, 900, "nomatch", null, "state-nomatch.png", false],
  [390, 844, "nomatch", null, "mobile-nomatch.png", false],
  [1440, 900, "seven", null, "state-filter-re.png", false, "filter-re"],
  [1440, 900, "full", null, "focus-disabled.png", false, "focus-disabled"],
  [760, 900, "seven", null, "tablet-760.png", false],
];
for (const [w, h, st, th, name, full, action] of shots) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(`${base}?state=${st}`, { waitUntil: "networkidle" });
  if (th) await p.evaluate((t) => { document.documentElement.dataset.theme = t; }, th);
  await p.addStyleTag({ content: ".review{display:none!important} html{scroll-behavior:auto!important}" });
  if (action === "scroll-catalog") await p.evaluate(() => window.scrollTo(0, document.getElementById("catalog").getBoundingClientRect().top + scrollY - 24));
  if (action === "scroll-rejected") await p.evaluate(() => document.querySelector(".row-error").scrollIntoView({ block: "center" }));
  if (action === "scroll-retired") await p.evaluate(() => document.getElementById("retired").scrollIntoView({ block: "center" }));
  if (action === "unfollow-retired") { await p.evaluate(() => document.getElementById("retired").scrollIntoView({ block: "center" })); await p.click("#retired .follow"); }
  if (action === "filter-re") await p.fill("#filter", "re");
  if (action === "focus-disabled") { await p.evaluate(() => window.scrollTo(0, document.getElementById("catalog").getBoundingClientRect().top + scrollY - 24)); await p.focus("#catalog .follow"); await p.keyboard.press("Shift+Tab"); await p.keyboard.press("Tab"); }
  await p.screenshot({ path: `${dir}/${name}`, fullPage: !!full });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) console.log("OVERFLOW", name, sw);
  await p.close();
}
await browser.close();
console.log("done");
