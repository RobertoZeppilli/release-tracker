import { describe, expect, it } from "vitest";
import type { ClassificationStrategy } from "./classification-strategy";
import { classify } from "./classify";

const classifyAlone = (version: string, strategy: ClassificationStrategy) => classify(version, strategy, [version]);

// Real Vite and React Versions from npm.
describe("classify with the semver strategy", () => {
  it.each([
    ["8.0.0", "featured"],
    ["6.0.0", "featured"],
    ["19.0.0", "featured"],
    ["8.3.0", "notable"],
    ["19.3.0", "notable"],
    ["8.3.1", "digest"],
    ["5.2.14", "digest"],
    ["19.2.8", "digest"],
  ])("%s is %s", (version, significance) => {
    expect(classifyAlone(version, "semver")).toBe(significance);
  });
});

// Real Node Versions from nodejs.org, without the leading v.
describe("classify with the node strategy", () => {
  it.each([
    ["22.0.0", "featured"],
    ["24.0.0", "featured"],
    ["23.0.0", "notable"],
    ["25.0.0", "notable"],
    ["24.11.0", "notable"],
    ["26.10.0", "notable"],
    ["24.11.1", "digest"],
    ["26.8.2", "digest"],
  ])("%s is %s", (version, significance) => {
    expect(classifyAlone(version, "node")).toBe(significance);
  });
});

// Real TypeScript Versions from npm, in publishing order.
const typescript = [
  "5.0.0-beta", "4.9.5", "5.0.1-rc", "5.0.2", "5.0.3", "5.0.4", "5.1.0-beta", "5.1.1-rc", "5.1.3", "5.1.5",
  "5.1.6", "5.8.0-beta", "5.8.1-rc", "5.8.2", "5.8.3", "5.9.0-beta", "5.9.1-rc", "5.9.2", "5.9.3",
  "5.9.0-dev.20250601", "5.8.0-insiders.20250110",
];

describe("classify with the typescript strategy", () => {
  it.each([
    ["5.0.2", "featured"],
    ["5.1.3", "featured"],
    ["5.8.2", "featured"],
    ["5.9.2", "featured"],
    ["5.0.3", "digest"],
    ["5.1.6", "digest"],
    ["5.9.3", "digest"],
    ["5.9.0-beta", "preview"],
    ["5.9.1-rc", "preview"],
    ["5.9.0-dev.20250601", "excluded"],
    ["5.8.0-insiders.20250110", "excluded"],
  ])("%s is %s", (version, significance) => {
    expect(classify(version, "typescript", typescript)).toBe(significance);
  });

  it("does not count an earlier Preview as the first stable Version of its x.y", () => {
    expect(classify("5.9.2", "typescript", ["5.9.0-beta", "5.9.1-rc", "5.9.2"])).toBe("featured");
  });
});

// Real esbuild Versions from npm; 1.0.0 onwards follows semver.
describe("classify with the zerover strategy", () => {
  it.each([
    ["0.25.0", "featured"],
    ["0.28.0", "featured"],
    ["0.25.12", "digest"],
    ["0.28.2", "digest"],
    ["0.0.9", "digest"],
    ["1.0.0", "featured"],
    ["1.2.0", "notable"],
    ["1.2.3", "digest"],
  ])("%s is %s", (version, significance) => {
    expect(classifyAlone(version, "zerover")).toBe(significance);
  });
});

// Real PHP, Rust, Kubernetes and Terraform Versions: the news rides in the minor.
describe("classify with the minor-major strategy", () => {
  it.each([
    ["8.5.0", "featured"],
    ["1.98.0", "featured"],
    ["1.37.0", "featured"],
    ["2.0.0", "featured"],
    ["8.4.26", "digest"],
    ["1.98.1", "digest"],
    ["1.37.1", "digest"],
    ["1.16.4", "digest"],
  ])("%s is %s", (version, significance) => {
    expect(classifyAlone(version, "minor-major")).toBe(significance);
  });
});

const strategies: ClassificationStrategy[] = ["semver", "node", "typescript", "zerover", "minor-major"];

describe.each(strategies)("classify Previews with the %s strategy", (strategy) => {
  it.each(["8.0.0-beta.18", "8.3.0-beta.1", "7.0.0-rc.1", "19.0.0-rc.0", "5.7.0-beta", "5.7.1-rc"])(
    "%s is a preview",
    (version) => {
      expect(classifyAlone(version, strategy)).toBe("preview");
    },
  );

  it.each([
    "6.0.0-alpha.24",
    "7.1.0-canary.3",
    "6.0.0-nightly.20240101",
    "5.0.0-experimental.1",
    "4.0.0-next.2",
    "18.0.0-rc.0-next-d3001fb6f-20211208",
    "19.0.0-rc-7670501b-20241124",
    "19.0.0-beta-26f2496093-20240514",
    "19.3.0-canary-2b19aecd-20260916",
  ])("%s is excluded", (version) => {
    expect(classifyAlone(version, strategy)).toBe("excluded");
  });

  it.each(["latest", "v8.0.0", "8.0", ""])("%j is not a Version and is excluded", (version) => {
    expect(classifyAlone(version, strategy)).toBe("excluded");
  });
});
