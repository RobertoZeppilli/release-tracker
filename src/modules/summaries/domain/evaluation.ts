import { locateCitation } from "./citations";
import type { BreakingChange, SummaryContent } from "./summary-content";

// What a human decided the Summary of one Release must say, written once in the evaluation set and
// compared against every version of the prompt. `match` are the words that have to appear in the
// claim for it to count as the same breaking change; `about` is the human wording, only for reading
// the report.
export type ExpectedBreakingChange = { id: string; about: string; match: string[] };

// `breakingChanges` must be found; `allowed` are the borderline ones the notes describe but a
// Summary may leave out — claiming one is not a mistake, so it is not reported as unexpected.
// `actionRequired` is "either" when only borderline changes are on the table and both verdicts read.
export type ExpectedSummary = {
  actionRequired: boolean | "either";
  breakingChanges: ExpectedBreakingChange[];
  allowed?: ExpectedBreakingChange[];
};

export type QuoteState = "verbatim" | "invented" | "none";

export type UnexpectedChange = { change: string; quote: QuoteState };

export type SummaryEvaluation = {
  actionRequiredMatches: boolean;
  found: string[];
  missing: string[];
  tolerated: string[];
  unexpected: UnexpectedChange[];
  inventedQuotes: string[];
  quoted: number;
  unquoted: number;
  titleLength: number;
};

type EvaluationInput = { expected: ExpectedSummary; content: SummaryContent; notes: string };

export function evaluateSummary({ expected, content, notes }: EvaluationInput): SummaryEvaluation {
  const claims = content.breakingChanges.map((change) => ({ change, text: claimText(change) }));
  const found: string[] = [];
  const missing: string[] = [];
  for (const expectation of expected.breakingChanges) {
    const matched = claims.some((claim) => matches(expectation, claim.text));
    (matched ? found : missing).push(expectation.id);
  }
  const allowed = expected.allowed ?? [];
  const tolerated = allowed.filter((expectation) => claims.some((claim) => matches(expectation, claim.text)));
  const covered = [...expected.breakingChanges, ...allowed];
  const unexpected = claims
    .filter((claim) => !covered.some((expectation) => matches(expectation, claim.text)))
    .map((claim) => ({ change: claim.change.change, quote: quoteState(notes, claim.change.quote) }));

  const items = [...content.keyPoints, ...content.breakingChanges];
  const quotes = items.map((item) => item.quote).filter((quote) => quote !== undefined);
  return {
    actionRequiredMatches: expected.actionRequired === "either" || content.actionRequired === expected.actionRequired,
    found,
    missing,
    tolerated: tolerated.map((expectation) => expectation.id),
    unexpected,
    inventedQuotes: quotes.filter((quote) => locateCitation(notes, quote) === null),
    quoted: quotes.filter((quote) => locateCitation(notes, quote) !== null).length,
    unquoted: items.length - quotes.length,
    titleLength: content.title.length,
  };
}

// A claim is the change and how to migrate together: the notes sometimes name the removed API only
// in the migration, and splitting the two would make an expectation impossible to write.
function claimText(change: BreakingChange): string {
  return `${change.change}\n${change.migration}`.toLowerCase();
}

function matches(expectation: ExpectedBreakingChange, claim: string): boolean {
  return expectation.match.every((keyword) => claim.includes(keyword.toLowerCase()));
}

function quoteState(notes: string, quote: string | undefined): QuoteState {
  if (quote === undefined) return "none";
  return locateCitation(notes, quote) === null ? "invented" : "verbatim";
}
