import { z } from "zod";

// 254 characters is the longest address an SMTP server has to accept (RFC 5321), and the same cap
// is in the schema: a field without one is a column with a megabyte in it.
export const MAX_EMAIL = 254;

// Trimmed and lower cased **before** it is judged, so `  A@B.com ` and `a@b.com` are one address and
// the unique index can do its job. The `max` is applied twice on purpose: once on what arrived, so a
// megabyte is refused before it is processed, and once on the result.
const emailSchema = z
  .string()
  .max(MAX_EMAIL)
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.email().max(MAX_EMAIL));

// The one shape of an address this product keeps: normalized, or nothing. It returns null instead of
// throwing because what arrives is a form field, and a form can be posted without the page: a
// malformed address is an answer to give the reader, not an exception.
export function normalizeEmail(value: unknown): string | null {
  const parsed = emailSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
