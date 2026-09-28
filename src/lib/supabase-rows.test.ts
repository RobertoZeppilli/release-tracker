import { describe, expect, it } from "vitest";
import { selectAllRows } from "./supabase-rows";

// The pages a fake PostgREST would answer, so the test can see the ranges that were asked for.
function pagedTable(rows: number) {
  const asked: [number, number][] = [];
  const table = Array.from({ length: rows }, (_, i) => ({ id: i }));
  const page = async (from: number, to: number) => {
    asked.push([from, to]);
    return { data: table.slice(from, to + 1), error: null };
  };
  return { asked, page };
}

describe("selectAllRows", () => {
  it("asks page after page until a short one comes back", async () => {
    const { asked, page } = pagedTable(1893);
    expect(await selectAllRows(page, 1000)).toHaveLength(1893);
    expect(asked).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  // A table that ends exactly on a page boundary looks full: the empty page is what says it is over.
  it("asks once more when the last page is full", async () => {
    const { asked, page } = pagedTable(2000);
    expect(await selectAllRows(page, 1000)).toHaveLength(2000);
    expect(asked).toHaveLength(3);
  });

  it("reads a table smaller than a page in one request", async () => {
    const { asked, page } = pagedTable(12);
    expect(await selectAllRows(page, 1000)).toHaveLength(12);
    expect(asked).toEqual([[0, 999]]);
  });

  it("throws what the database said instead of returning half a table", async () => {
    await expect(selectAllRows(async () => ({ data: null, error: { message: "boom" } }))).rejects.toThrow("boom");
  });
});
