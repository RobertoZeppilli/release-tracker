import { z } from "zod";

// Strategies for Node, TypeScript and 0.x libraries join this list with their `classify` rules.
export const ClassificationStrategySchema = z.enum(["semver"]);

export type ClassificationStrategy = z.infer<typeof ClassificationStrategySchema>;
