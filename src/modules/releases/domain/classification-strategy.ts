import { z } from "zod";

export const ClassificationStrategySchema = z.enum(["semver", "node", "typescript", "zerover", "minor-major"]);

export type ClassificationStrategy = z.infer<typeof ClassificationStrategySchema>;
