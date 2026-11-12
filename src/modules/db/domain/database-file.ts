import { posix, win32 } from "node:path";

export const DATABASE_FILE_NAME = "verdict.db";

export type DatabaseLocation = {
  platform: NodeJS.Platform;
  home: string;
  env: Partial<Record<string, string>>;
  /**
   * Only read to resolve a relative `VERDICT_DATA_DIR`. Left out, a relative one comes back
   * relative, for whoever calls to resolve: `defaultDatabaseFile` always passes it.
   */
  cwd?: string;
};

// Where the data lives on the disk of whoever installed the app (issue #211, ADR 0011). The app has
// no server to keep it on, so the file follows the conventions of each system instead of sitting
// next to the package, which `npx` throws away between runs.
export function databaseFile({ platform, home, env, cwd }: DatabaseLocation): string {
  const path = platform === "win32" ? win32 : posix;
  return path.join(dataDirectory(path, platform, home, env, cwd), DATABASE_FILE_NAME);
}

function dataDirectory(
  path: typeof posix,
  platform: NodeJS.Platform,
  home: string,
  env: Partial<Record<string, string>>,
  cwd: string | undefined,
): string {
  // An empty or blank value is how a shell passes "unset" by accident, and taking it at its word
  // would put the data file at the root of the volume.
  const chosen = env.VERDICT_DATA_DIR?.trim();
  if (chosen) return cwd ? path.resolve(cwd, chosen) : chosen;

  if (platform !== "win32") return path.join(home, ".verdict");

  // `LOCALAPPDATA` is what Windows itself reads; the fallback is where it points on every install
  // that has not been told otherwise, which beats writing a dot directory Explorer hides anyway.
  const localAppData = env.LOCALAPPDATA?.trim() || path.join(home, "AppData", "Local");
  return path.join(localAppData, "verdict");
}
