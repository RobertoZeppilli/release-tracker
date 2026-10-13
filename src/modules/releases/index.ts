export { ClassificationStrategySchema, type ClassificationStrategy } from "./domain/classification-strategy";
export { classify } from "./domain/classify";
export { type DefaultStart, type DefaultStartReason, defaultUpgradeStart } from "./domain/default-upgrade-start";
export { latestStableRelease, latestStableVersion } from "./domain/latest-stable";
export { type GroupedReleases, groupByMajor, type ListedRelease, type MajorGroup, type MajorRow } from "./domain/group-by-major";
export {
  initialSummaryStatus,
  type SummaryStatus,
  SummaryStatusSchema,
} from "./domain/initial-summary-status";
export { publicPagesFor, type ReleaseRef } from "./domain/revalidation";
export { type RowVerdict, rowVerdict, type Tone } from "./domain/row-verdict";
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
  upgradeStartRejection,
} from "./domain/upgrade-path";
export { compareVersions, type ParsedVersion, parseVersion } from "./domain/version";
export {
  fillVersionTemplate,
  unknownVersionPlaceholders,
  VERSION_PLACEHOLDERS,
} from "./domain/version-template";
export { noteLines, type ReleaseDetail, releasePath, versionFromPath } from "./domain/release-page";
export { type SitemapPage, sitemapPages, type SitemapRelease, type SitemapTechnology } from "./domain/sitemap";
export { releaseMeta, type ReleaseMeta } from "./domain/page-metadata";
