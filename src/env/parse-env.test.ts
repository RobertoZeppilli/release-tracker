import { describe, expect, it } from "vitest";
import { InvalidEnvError, parseEnv, parseServerEnv } from "./parse-env";

const valid = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local",
};

describe("parseEnv", () => {
  it("returns the validated variables", () => {
    expect(parseEnv(valid)).toEqual(valid);
  });

  it("names a missing variable in the error", () => {
    expect(() => parseEnv({})).toThrow(InvalidEnvError);
    expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects an invalid value", () => {
    expect(() => parseEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects a secret key in the public key variable", () => {
    expect(() => parseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_local" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });
});

describe("parseServerEnv", () => {
  it("returns the secret key", () => {
    expect(parseServerEnv({ SUPABASE_SECRET_KEY: "sb_secret_local" })).toEqual({
      SUPABASE_SECRET_KEY: "sb_secret_local",
    });
  });

  it("rejects a key that is not a secret key", () => {
    expect(() => parseServerEnv({ SUPABASE_SECRET_KEY: "sb_publishable_local" })).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it("accepts a missing or empty job secret", () => {
    expect(parseServerEnv({ SUPABASE_SECRET_KEY: "sb_secret_local", CRON_SECRET: "" }).CRON_SECRET).toBeUndefined();
  });

  it("rejects a short job secret", () => {
    expect(() => parseServerEnv({ SUPABASE_SECRET_KEY: "sb_secret_local", CRON_SECRET: "short" })).toThrow(/CRON_SECRET/);
  });
});
