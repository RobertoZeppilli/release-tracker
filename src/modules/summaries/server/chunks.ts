// `.in()` filters travel in the URL: large id lists are split to stay well under its length limit.
export function chunks<T>(items: readonly T[], size = 100): T[][] {
  const parts: T[][] = [];
  for (let start = 0; start < items.length; start += size) parts.push(items.slice(start, start + size));
  return parts;
}
