import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { exchangeCodeForSession, signOut } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase-request", () => ({
  createRequestClient: async () => ({ auth: { exchangeCodeForSession, signOut } }),
}));

function callback(params: string): NextRequest {
  return new NextRequest(`https://verdict.test/auth/callback${params}`);
}

function location(response: Response): string {
  return new URL(response.headers.get("location") ?? "").pathname;
}

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  signOut.mockReset();
});

describe("the auth callback", () => {
  // The account a Developer signs up with is born in this exchange, a moment before this code runs.
  // Issue #206 recognised that account and deleted it again; issue #219 took that door away, and
  // this test is what says it did not come back.
  it("leaves an account born a moment ago signed in", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: { id: "new-developer", created_at: new Date().toISOString() } },
      error: null,
    });

    const response = await GET(callback("?code=abc&next=/dashboard"));

    expect(location(response)).toBe("/dashboard");
    expect(signOut).not.toHaveBeenCalled();
  });

  // GitHub sends no code back when the Developer refuses the authorization.
  it("names the refusal when no code comes back", async () => {
    const response = await GET(callback(""));

    expect(location(response)).toBe("/login");
    expect(new URL(response.headers.get("location") ?? "").search).toBe("?error=denied");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("names the exchange when the code cannot be spent", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: new Error("expired") });

    const response = await GET(callback("?code=stale"));

    expect(new URL(response.headers.get("location") ?? "").search).toBe("?error=exchange");
  });
});
