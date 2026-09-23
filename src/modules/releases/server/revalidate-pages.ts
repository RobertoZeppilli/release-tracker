import { revalidatePath } from "next/cache";
import { publicPagesFor, type ReleaseRef } from "../domain/revalidation";

// Called from a job's Route Handler when a Summary settles or a Release is recorded: the ISR entry
// of each touched page is marked stale and rebuilt on the next visit, without a deploy. Targeted,
// so the rest of the site keeps its cache. Returns the paths, for the job's report.
export function revalidateReleasePages(refs: ReleaseRef[]): string[] {
  const paths = publicPagesFor(refs);
  for (const path of paths) revalidatePath(path);
  return paths;
}
