import { describe, expect, it } from "vitest";

import { databaseFile } from "./database-file";

describe("databaseFile", () => {
  it("puts the file under a dot directory of the home on linux and macos", () => {
    expect(databaseFile({ platform: "linux", home: "/home/ada", env: {} })).toBe("/home/ada/.verdict/verdict.db");
    expect(databaseFile({ platform: "darwin", home: "/Users/ada", env: {} })).toBe("/Users/ada/.verdict/verdict.db");
  });

  it("follows the local app data of the account on windows", () => {
    expect(
      databaseFile({
        platform: "win32",
        home: "C:\\Users\\ada",
        env: { LOCALAPPDATA: "C:\\Users\\ada\\AppData\\Local" },
      }),
    ).toBe("C:\\Users\\ada\\AppData\\Local\\verdict\\verdict.db");
  });

  it("falls back to the usual place when windows does not say where its local app data is", () => {
    expect(databaseFile({ platform: "win32", home: "C:\\Users\\ada", env: {} })).toBe(
      "C:\\Users\\ada\\AppData\\Local\\verdict\\verdict.db",
    );
  });

  it("lets VERDICT_DATA_DIR move the file anywhere", () => {
    expect(databaseFile({ platform: "linux", home: "/home/ada", env: { VERDICT_DATA_DIR: "/mnt/backup" } })).toBe(
      "/mnt/backup/verdict.db",
    );
    expect(
      databaseFile({
        platform: "win32",
        home: "C:\\Users\\ada",
        env: { LOCALAPPDATA: "C:\\Users\\ada\\AppData\\Local", VERDICT_DATA_DIR: "D:\\dati" },
      }),
    ).toBe("D:\\dati\\verdict.db");
  });

  it("resolves a relative VERDICT_DATA_DIR against the working directory", () => {
    expect(
      databaseFile({ platform: "linux", home: "/home/ada", env: { VERDICT_DATA_DIR: "dati" }, cwd: "/srv/verdict" }),
    ).toBe("/srv/verdict/dati/verdict.db");
  });

  // An empty variable is how a shell passes "unset" by accident: `VERDICT_DATA_DIR=$MISSING`.
  // Taking it at its word would put the data file at the root of the disk.
  it("ignores an empty or blank VERDICT_DATA_DIR", () => {
    expect(databaseFile({ platform: "linux", home: "/home/ada", env: { VERDICT_DATA_DIR: "" } })).toBe(
      "/home/ada/.verdict/verdict.db",
    );
    expect(databaseFile({ platform: "linux", home: "/home/ada", env: { VERDICT_DATA_DIR: "   " } })).toBe(
      "/home/ada/.verdict/verdict.db",
    );
  });
});
