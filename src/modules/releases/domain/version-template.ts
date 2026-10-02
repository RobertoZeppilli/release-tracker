import { parseVersion } from "./version";

// The parts of a Version that can be named in a template, e.g. `v{major}.{minor}-{prerelease}`.
// `{version}` is the Version as the source spells it; the others are read out of it.
export const VERSION_PLACEHOLDERS = ["version", "major", "minor", "patch", "prerelease"] as const;

const KNOWN: ReadonlySet<string> = new Set(VERSION_PLACEHOLDERS);

const PLACEHOLDER = /\{([^{}]*)\}/g;

// The names a template uses that are not parts of a Version, so a typo is a refusal and not a tag
// nobody will ever find.
export function unknownVersionPlaceholders(template: string): string[] {
  const names = [...template.matchAll(PLACEHOLDER)].map(([, name]) => name);
  return names.filter((name) => !KNOWN.has(name));
}

// Null when the template needs parts and the Version is not SemVer, or when it names a part the
// Version does not have: a stable Version has no prerelease, so `{prerelease}` has nothing to put
// there and the filled template would name a tag that cannot exist. A template of `{version}` alone
// never needs to parse, which is why a Version that is not SemVer still gets its tag.
export function fillVersionTemplate(template: string, version: string): string | null {
  const parsed = parseVersion(version);
  let missing = false;

  const filled = template.replace(PLACEHOLDER, (whole, name: string) => {
    if (name === "version") return version;
    if (parsed === null) {
      missing = true;
      return "";
    }
    switch (name) {
      case "major":
        return String(parsed.major);
      case "minor":
        return String(parsed.minor);
      case "patch":
        return String(parsed.patch);
      case "prerelease":
        if (parsed.prerelease.length === 0) missing = true;
        return parsed.prerelease.join(".");
      default:
        return whole;
    }
  });

  return missing ? null : filled;
}
