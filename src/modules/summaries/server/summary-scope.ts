// The jobs walk every Summary in the database. A fence by Technology lets the integration tests run
// them for real against a database that holds the whole Catalog, without touching the Summaries they
// did not seed (issue #55). Left out, the job keeps its real reach: all of them.
export type SummaryScope = { technologyIds?: string[] };
