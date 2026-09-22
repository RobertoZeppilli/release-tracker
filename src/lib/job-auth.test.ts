import { describe, expect, it } from "vitest";
import { isAuthorizedJob } from "./job-auth";

const secret = "s".repeat(32);

function request(authorization?: string): Request {
  return new Request("http://localhost/api/jobs/summaries/submit", {
    headers: authorization === undefined ? {} : { authorization },
  });
}

describe("isAuthorizedJob", () => {
  it("accepts the bearer secret", () => {
    expect(isAuthorizedJob(request(`Bearer ${secret}`), secret)).toBe(true);
  });

  it("rejects a missing, wrong or differently sized secret", () => {
    expect(isAuthorizedJob(request(), secret)).toBe(false);
    expect(isAuthorizedJob(request(`Bearer ${"x".repeat(32)}`), secret)).toBe(false);
    expect(isAuthorizedJob(request(`Bearer ${secret}x`), secret)).toBe(false);
    expect(isAuthorizedJob(request(secret), secret)).toBe(false);
  });

  it("rejects every request when no secret is configured", () => {
    expect(isAuthorizedJob(request("Bearer "), undefined)).toBe(false);
    expect(isAuthorizedJob(request("Bearer undefined"), undefined)).toBe(false);
  });
});
