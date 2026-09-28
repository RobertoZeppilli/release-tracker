import { describe, expect, it } from "vitest";
import { isoWeekKey, isoWeekOf, isoWeekRange, parseIsoWeekKey } from "./iso-week";

describe("isoWeekOf", () => {
  it("numbers a week from its Thursday, in UTC", () => {
    expect(isoWeekOf(new Date("2024-12-05T00:00:00Z"))).toEqual({ year: 2024, week: 49 });
  });

  it("keeps Sunday in the week that started on Monday", () => {
    expect(isoWeekOf(new Date("2024-12-08T23:59:59Z"))).toEqual({ year: 2024, week: 49 });
    expect(isoWeekOf(new Date("2024-12-09T00:00:00Z"))).toEqual({ year: 2024, week: 50 });
  });

  it("gives the first days of January to the last week of the year before", () => {
    // 2021-01-01 is a Friday: ISO puts it in week 53 of 2020, which has 53 weeks.
    expect(isoWeekOf(new Date("2021-01-01T00:00:00Z"))).toEqual({ year: 2020, week: 53 });
  });

  it("gives the last days of December to the first week of the year after", () => {
    // 2024-12-30 is a Monday: its Thursday falls in 2025, so the week belongs to 2025.
    expect(isoWeekOf(new Date("2024-12-30T00:00:00Z"))).toEqual({ year: 2025, week: 1 });
  });

  it("reads a date late in the day as the same week as the same date at midnight", () => {
    expect(isoWeekOf(new Date("2026-01-04T23:30:00Z"))).toEqual(isoWeekOf(new Date("2026-01-04T00:00:00Z")));
  });
});

describe("isoWeekKey and parseIsoWeekKey", () => {
  it("writes a key that sorts and reads back", () => {
    expect(isoWeekKey({ year: 2024, week: 49 })).toBe("2024-W49");
    expect(isoWeekKey({ year: 2025, week: 1 })).toBe("2025-W01");
    expect(parseIsoWeekKey("2025-W01")).toEqual({ year: 2025, week: 1 });
  });

  it("refuses anything that is not a week key, so a hand-edited URL cannot open a week that does not exist", () => {
    expect(parseIsoWeekKey("2025-W00")).toBeNull();
    expect(parseIsoWeekKey("2025-W54")).toBeNull();
    expect(parseIsoWeekKey("2025-49")).toBeNull();
    expect(parseIsoWeekKey("")).toBeNull();
  });
});

describe("isoWeekRange", () => {
  it("runs from Monday to Sunday in UTC", () => {
    expect(isoWeekRange({ year: 2024, week: 49 })).toEqual({
      start: new Date("2024-12-02T00:00:00Z"),
      end: new Date("2024-12-08T00:00:00Z"),
    });
  });

  it("crosses the year boundary on week 1", () => {
    expect(isoWeekRange({ year: 2025, week: 1 })).toEqual({
      start: new Date("2024-12-30T00:00:00Z"),
      end: new Date("2025-01-05T00:00:00Z"),
    });
  });

  it("returns for week 53 the week that its own dates belong to", () => {
    const { start, end } = isoWeekRange({ year: 2020, week: 53 });
    expect(start).toEqual(new Date("2020-12-28T00:00:00Z"));
    expect(isoWeekOf(end)).toEqual({ year: 2020, week: 53 });
  });
});
