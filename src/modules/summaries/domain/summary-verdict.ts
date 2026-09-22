import { z } from "zod";

// The part of a Summary's content that the Upgrade Path reads. The full output schema extends it.
export const SummaryVerdictSchema = z.object({ actionRequired: z.boolean() });
