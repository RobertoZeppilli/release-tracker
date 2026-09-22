import { z } from "zod";

export const ClassificationStrategySchema = z.enum(["semver", "node", "typescript", "zerover"]);

export type ClassificationStrategy = z.infer<typeof ClassificationStrategySchema>;
