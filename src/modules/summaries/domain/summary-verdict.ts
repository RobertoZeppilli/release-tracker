import { z } from "zod";
import { type NotesHead, notesJudgeable } from "./notes-judgement";

// The part of a Summary's content that the Upgrade Path reads. The full output schema extends it.
export const SummaryVerdictSchema = z.object({ actionRequired: z.boolean() });

// `unjudged` is a ready Summary whose Release Notes could not be judged: there is a Summary, but no
// verdict stands on it. `actionRequired` goes null with it, so every count that already treats a
// Release without a verdict as one to check keeps doing the right thing without knowing about this.
export type Judged = { actionRequired: boolean | null; unjudged: boolean };

// CONTEXT.md, Note giudicabili: a `safe to upgrade` stands only on notes that described something.
// "We found no breaking changes" and "there are no breaking changes" are different claims, and the
// product does not print the second when it means the first.
export function judge(actionRequired: boolean | null, notes: NotesHead | null): Judged {
  if (actionRequired === false && !notesJudgeable(notes)) return { actionRequired: null, unjudged: true };
  return { actionRequired, unjudged: false };
}
