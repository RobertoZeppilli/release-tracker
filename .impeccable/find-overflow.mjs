import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 700, height: 900 } });
await p.goto("file:///C:/Users/rober/progetti/release-tracker/design/mocks/technology.html", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > 700 && !e.closest(".review")).slice(0, 8).map(e => `${e.tagName}.${e.className} ${Math.round(e.getBoundingClientRect().right)}`)));
await b.close();
