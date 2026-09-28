import { describe, expect, it } from "vitest";
import { readOpenWeeks, withWeek } from "./week-param";

describe("readOpenWeeks", () => {
  it("reads the weeks of the parameter, newest first and without repetitions", () => {
    expect(readOpenWeeks("2024-W48,2024-W49,2024-W48")).toEqual(["2024-W49", "2024-W48"]);
  });

  it("drops anything that is not a week key, because the URL can be hand-edited", () => {
    expect(readOpenWeeks("2024-W49,nonsense,2024-W99")).toEqual(["2024-W49"]);
    expect(readOpenWeeks(undefined)).toEqual([]);
    expect(readOpenWeeks("")).toEqual([]);
  });

  it("accepts the parameter repeated in the query string", () => {
    expect(readOpenWeeks(["2024-W49", "2024-W47"])).toEqual(["2024-W49", "2024-W47"]);
  });
});

describe("withWeek", () => {
  it("adds and removes one week, leaving the others alone", () => {
    expect(withWeek("2024-W49", "2024-W48", true)).toBe("2024-W49,2024-W48");
    expect(withWeek("2024-W49,2024-W48", "2024-W49", false)).toBe("2024-W48");
  });

  it("gives back nothing when the last open week is closed, so the parameter leaves the URL", () => {
    expect(withWeek("2024-W49", "2024-W49", false)).toBeNull();
  });
});
