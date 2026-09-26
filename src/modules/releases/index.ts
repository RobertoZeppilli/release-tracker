export { ClassificationStrategySchema, type ClassificationStrategy } from "./domain/classification-strategy";
export { classify } from "./domain/classify";
export { latestStableVersion } from "./domain/latest-stable";
export { type GroupedReleases, groupByMajor, type ListedRelease, type MajorGroup, type MajorRow } from "./domain/group-by-major";
export {
  initialSummaryStatus,
  type SummaryStatus,
  SummaryStatusSchema,
} from "./domain/initial-summary-status";
export { publicPagesFor, type ReleaseRef } from "./domain/revalidation";
export {
  type DetectedRelease,
  type DetectionCandidate,
  type KnownReleases,
  selectDetected,
} from "./domain/select-detected";
export { type ImportCandidate, selectInitialImport } from "./domain/select-initial-import";
export { SignificanceSchema, type Significance } from "./domain/significance";
export {
  computeUpgradePath,
  type InvalidFrom,
  type PathCounts,
  type PathMajor,
  type PathRelease,
  type SummarizedRelease,
  type UpgradePath,
} from "./domain/upgrade-path";
export { noteLines, type ReleaseDetail, releasePath, versionFromPath } from "./domain/release-page";
