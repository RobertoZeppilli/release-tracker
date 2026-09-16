import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("file:///C:/Users/rober/progetti/release-tracker/design/mocks/technology.html", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, verdictLines: Math.round(document.getElementById("range-verdict").getBoundingClientRect().height) })));
await b.close();
