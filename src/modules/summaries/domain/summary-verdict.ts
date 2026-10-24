import { z } from "zod";
import { type NotesHead, notesJudgeable } from "./notes-judgement";

// The part of a Summary's content that the Upgrade Path reads. The full output schema extends it.
// `notesJudgeable` arrives with the prompt `v7` (issue #93): the Summaries stored before it do not
// carry the field, so it is optional here and the heuristic answers for them.
export const SummaryVerdictSchema = z.object({
  actionRequired: z.boolean(),
  notesJudgeable: z.boolean().optional(),
});

export type SummaryVerdict = z.infer<typeof SummaryVerdictSchema>;

// `unjudged` is a ready Summary whose Release Notes could not be judged: there is a Summary, but no
// verdict stands on it. `actionRequired` goes null with it, so every count that already treats a
// Release without a verdict as one to check keeps doing the right thing without knowing about this.
export type Judged = { actionRequired: boolean | null; unjudged: boolean };

// GLOSSARY.md, Note giudicabili: a `safe to upgrade` stands only on notes that described something.
// "We found no breaking changes" and "there are no breaking changes" are different claims, and the
// product does not print the second when it means the first.
//
// Who answers the question: the model when it did, because it read the whole notes, while the
// heuristic of `notesJudgeable` reads only the first 400 characters and is written to stay silent in
// doubt. A `null` verdict is a Release with no ready Summary, which is a different silence.
export function judge(verdict: SummaryVerdict | null, notes: NotesHead | null): Judged {
  if (verdict === null) return { actionRequired: null, unjudged: false };
  const judgeable = verdict.notesJudgeable ?? notesJudgeable(notes);
  if (!verdict.actionRequired && !judgeable) return { actionRequired: null, unjudged: true };
  return { actionRequired: verdict.actionRequired, unjudged: false };
}
