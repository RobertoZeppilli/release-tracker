// PostgREST answers at most a thousand rows and says nothing about the ones it left out, so a query
// over a whole table is a lie the day the table outgrows the page. Asking by page until a short one
// comes back is the only answer that stays true as the Catalog grows.
export const PAGE_ROWS = 1000;

export async function selectAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageRows: number = PAGE_ROWS,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageRows) {
    const { data, error } = await page(from, from + pageRows - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageRows) return rows;
  }
}
