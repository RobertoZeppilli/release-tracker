import type { ClassificationStrategy } from "./classification-strategy";
import type { Significance } from "./significance";
import { parseVersion } from "./version";

export function classify(version: string, strategy: ClassificationStrategy): Significance | "excluded" {
  switch (strategy) {
    case "semver":
      return classifySemver(version);
  }
}

function classifySemver(version: string): Significance | "excluded" {
  const parsed = parseVersion(version);
  if (!parsed) return "excluded";
  if (parsed.prerelease.length > 0) return classifyPrerelease(parsed.prerelease);
  if (parsed.minor === 0 && parsed.patch === 0) return "featured";
  if (parsed.patch === 0) return "notable";
  return "digest";
}

// Only beta and rc are Previews; alpha, canary, nightly and any other tag are not Releases.
function classifyPrerelease([tag]: string[]): "preview" | "excluded" {
  return tag === "beta" || tag === "rc" ? "preview" : "excluded";
}
