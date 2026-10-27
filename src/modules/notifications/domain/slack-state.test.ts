import { describe, expect, it } from "vitest";
import { buildState, readState, type Signer, STATE_TTL_MS } from "./slack-state";

// A signature that is a function of the payload and of a key, which is all `readState` asks of one:
// the real one is an HMAC over the same payload (`server/slack-oauth.ts`).
const signWith = (key: string): Signer => (payload) => `${key}:${payload.length}:${payload.slice(0, 6)}`;

const sign = signWith("right");
const USER = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const NOW = new Date("2026-10-27T10:00:00.000Z");

describe("buildState", () => {
  it("carries the Developer and the locale through a round", () => {
    expect(readState(buildState({ userId: USER, locale: "it", now: NOW }, sign), sign, NOW)).toEqual({
      userId: USER,
      locale: "it",
    });
  });

  // The payload is encoded and not encrypted, which is why nothing secret goes in it: the id is
  // there to be read back by us, and it is signed so that it cannot be changed on the way.
  it("does not carry the Developer's id in the open", () => {
    expect(buildState({ userId: USER, locale: "en", now: NOW }, sign)).not.toContain(USER);
  });
});

describe("readState", () => {
  it("refuses a state signed with another key, which is the forged return Slack warns about", () => {
    const forged = buildState({ userId: USER, locale: "en", now: NOW }, signWith("wrong"));
    expect(readState(forged, sign, NOW)).toBeNull();
  });

  it("refuses a payload changed after it was signed", () => {
    const state = buildState({ userId: USER, locale: "en", now: NOW }, sign);
    const [payload, signature] = state.split(".");
    const other = btoa(JSON.stringify({ u: USER, l: "en", t: NOW.getTime() + 1 })).replace(/=+$/, "");
    expect(readState(`${other}.${signature}`, sign, NOW)).toBeNull();
    expect(payload).not.toEqual(other);
  });

  it("refuses a state with no signature at all", () => {
    expect(readState("", sign, NOW)).toBeNull();
    expect(readState("nodot", sign, NOW)).toBeNull();
    expect(readState(".onlyasignature", sign, NOW)).toBeNull();
  });

  it("refuses a state that is not a payload of ours, however well signed", () => {
    const payload = btoa(JSON.stringify({ hello: "world" })).replace(/=+$/, "");
    expect(readState(`${payload}.${sign(payload)}`, sign, NOW)).toBeNull();
  });

  it("refuses a user id that is not a uuid, so the id cannot be a statement of its own", () => {
    const payload = btoa(JSON.stringify({ u: "me", l: "en", t: NOW.getTime() })).replace(/=+$/, "");
    expect(readState(`${payload}.${sign(payload)}`, sign, NOW)).toBeNull();
  });

  it("refuses a locale the product does not have", () => {
    const payload = btoa(JSON.stringify({ u: USER, l: "jp", t: NOW.getTime() })).replace(/=+$/, "");
    expect(readState(`${payload}.${sign(payload)}`, sign, NOW)).toBeNull();
  });

  it("holds for its ten minutes and not a millisecond longer", () => {
    const state = buildState({ userId: USER, locale: "en", now: NOW }, sign);
    const inTime = new Date(NOW.getTime() + STATE_TTL_MS);
    const late = new Date(NOW.getTime() + STATE_TTL_MS + 1);
    expect(readState(state, sign, inTime)).not.toBeNull();
    expect(readState(state, sign, late)).toBeNull();
  });

  it("refuses a state made in the future, which was not made here", () => {
    const state = buildState({ userId: USER, locale: "en", now: new Date(NOW.getTime() + 1000) }, sign);
    expect(readState(state, sign, NOW)).toBeNull();
  });
});
