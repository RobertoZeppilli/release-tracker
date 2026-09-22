import type { ClassificationStrategy } from "./classification-strategy";
import type { Significance } from "./significance";
import { type ParsedVersion, parseVersion } from "./version";

type Stable = Omit<ParsedVersion, "prerelease">;

// `observed` holds every Version the detection Sources report, `version` included: TypeScript needs
// it to tell the first stable Version of an x.y from its patches.
export function classify(
  version: string,
  strategy: ClassificationStrategy,
  observed: readonly string[],
): Significance | "excluded" {
  const parsed = parseVersion(version);
  if (!parsed) return "excluded";
  if (parsed.prerelease.length > 0) return classifyPrerelease(parsed.prerelease);
  switch (strategy) {
    case "semver":
      return classifySemver(parsed);
    case "node":
      return classifyNode(parsed);
    case "typescript":
      return classifyTypeScript(parsed, observed);
    case "zerover":
      return classifyZerover(parsed);
  }
}

function classifySemver({ minor, patch }: Stable): Significance {
  if (minor === 0 && patch === 0) return "featured";
  return patch === 0 ? "notable" : "digest";
}

// Even majors become LTS; odd majors are short-lived.
function classifyNode(version: Stable): Significance {
  const significance = classifySemver(version);
  return significance === "featured" && version.major % 2 === 1 ? "notable" : significance;
}

// TypeScript ships each x.y after a beta (x.y.0) and an rc (x.y.1), so its first stable is x.y.2 or later.
function classifyTypeScript(version: Stable, observed: readonly string[]): Significance {
  const earlierStable = observed.some((other) => {
    const parsed = parseVersion(other);
    return (
      parsed !== null &&
      parsed.prerelease.length === 0 &&
      parsed.major === version.major &&
      parsed.minor === version.minor &&
      parsed.patch < version.patch
    );
  });
  return earlierStable ? "digest" : "featured";
}

// In 0.x the minor is the breaking part, as npm's ^0.y ranges assume.
function classifyZerover(version: Stable): Significance {
  if (version.major > 0) return classifySemver(version);
  return version.minor > 0 && version.patch === 0 ? "featured" : "digest";
}

// Only a bare beta or rc, optionally numbered, is a Preview; builds with a hash or date are nightlies.
function classifyPrerelease(prerelease: readonly string[]): "preview" | "excluded" {
  const [tag, number, ...rest] = prerelease;
  const isPreviewTag = tag === "beta" || tag === "rc";
  const isNumbered = number === undefined || /^\d+$/.test(number);
  return isPreviewTag && isNumbered && rest.length === 0 ? "preview" : "excluded";
}
