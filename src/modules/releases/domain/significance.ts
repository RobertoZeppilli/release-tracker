import { z } from "zod";

export const SignificanceSchema = z.enum(["featured", "notable", "digest", "preview"]);

export type Significance = z.infer<typeof SignificanceSchema>;
